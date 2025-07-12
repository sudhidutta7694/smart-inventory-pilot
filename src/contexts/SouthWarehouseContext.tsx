import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products as initialProducts, insights as initialInsights, type Product, type Insight, type MetricData, metricsData as initialMetricsData } from '@/data/mockData';
import { RerouteRequest, Notification } from '@/types/warehouse';

interface SouthWarehouseContextType {
  // Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  refreshProducts: () => void;
  isLoading: boolean;
  
  // Insights
  insights: Insight[];
  
  // Metrics
  metricsData: MetricData[];
  
  // Rerouting
  rerouteRequests: RerouteRequest[];
  notifications: Notification[];
  addRerouteRequest: (request: Omit<RerouteRequest, 'id' | 'requestedAt'>) => void;
  approveReroute: (id: string) => void;
  rejectReroute: (id: string) => void;
  startTransit: (id: string) => void;
  confirmDelivery: (id: string) => void;
  completeReroute: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
}

const SouthWarehouseContext = createContext<SouthWarehouseContextType | undefined>(undefined);

export const useSouthWarehouse = () => {
  const context = useContext(SouthWarehouseContext);
  if (!context) {
    throw new Error('useSouthWarehouse must be used within a SouthWarehouseProvider');
  }
  return context;
};

const SOUTH_STORAGE_KEY = 'mockData_south';
const CROSS_WAREHOUSE_KEY = 'cross_warehouse_notifications';

export const SouthWarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [rerouteRequests, setRerouteRequests] = useState<RerouteRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cross-warehouse communication helper
  const sendCrossWarehouseNotification = useCallback((notification: Notification) => {
    try {
      const existingCrossNotifications = JSON.parse(localStorage.getItem(CROSS_WAREHOUSE_KEY) || '[]');
      const updatedNotifications = [...existingCrossNotifications, notification];
      localStorage.setItem(CROSS_WAREHOUSE_KEY, JSON.stringify(updatedNotifications));
      
      // Trigger storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: CROSS_WAREHOUSE_KEY,
        newValue: JSON.stringify(updatedNotifications)
      }));
    } catch (error) {
      console.error('Error sending cross-warehouse notification:', error);
    }
  }, []);

  // Listen for cross-warehouse notifications
  useEffect(() => {
    const handleCrossWarehouseNotifications = () => {
      try {
        const crossNotifications = JSON.parse(localStorage.getItem(CROSS_WAREHOUSE_KEY) || '[]');
        const southNotifications = crossNotifications.filter((notif: Notification) => 
          notif.targetWarehouse === 'South'
        );
        
        if (southNotifications.length > 0) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newNotifications = southNotifications.filter((n: Notification) => !existingIds.has(n.id));
            return newNotifications.length > 0 ? [...prev, ...newNotifications] : prev;
          });
        }
      } catch (error) {
        console.error('Error processing cross-warehouse notifications:', error);
      }
    };

    // Initial check
    handleCrossWarehouseNotifications();

    // Listen for storage changes
    window.addEventListener('storage', handleCrossWarehouseNotifications);
    
    // Listen for storage changes to update local reroute requests
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === SOUTH_STORAGE_KEY && e.newValue) {
        try {
          const parsedData = JSON.parse(e.newValue);
          if (parsedData.rerouteRequests) {
            setRerouteRequests(parsedData.rerouteRequests);
          }
        } catch (error) {
          console.error('Error updating reroute requests from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('storage', handleCrossWarehouseNotifications);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Load data from localStorage or initialize with defaults
  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(SOUTH_STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setProducts(parsedData.products || initialProducts.filter(p => p.zone === 'South'));
        setInsights(parsedData.insights || initialInsights.filter(i => i.zone === 'South'));
        setMetricsData(parsedData.metricsData || initialMetricsData);
        setRerouteRequests(parsedData.rerouteRequests || []);
        setNotifications(parsedData.notifications || []);
      } else {
        // Initialize with South-specific data
        const southProducts = initialProducts.filter(p => p.zone === 'South');
        const southInsights = initialInsights.filter(i => i.zone === 'South');
        setProducts(southProducts);
        setInsights(southInsights);
        setMetricsData(initialMetricsData);
        setRerouteRequests([]);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading South warehouse data:', error);
      setProducts(initialProducts.filter(p => p.zone === 'South'));
      setInsights(initialInsights.filter(i => i.zone === 'South'));
      setMetricsData(initialMetricsData);
      setRerouteRequests([]);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback(() => {
    try {
      const dataToSave = {
        products,
        insights,
        metricsData,
        rerouteRequests,
        notifications
      };
      localStorage.setItem(SOUTH_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving South warehouse data:', error);
    }
  }, [products, insights, metricsData, rerouteRequests, notifications]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [saveData, isLoading]);

  // Inventory methods
  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `SKU${String(Date.now()).slice(-6)}`,
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product =>
      product.id === id ? { ...product, ...updates } : product
    ));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  }, []);

  const refreshProducts = useCallback(() => {
    loadData();
  }, [loadData]);

  // Rerouting methods with proper notification flow
  const addRerouteRequest = useCallback((request: Omit<RerouteRequest, 'id' | 'requestedAt'>) => {
    const newRequest: RerouteRequest = {
      ...request,
      id: `REQ-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      transitProgress: 0
    };
    setRerouteRequests(prev => [...prev, newRequest]);

    // Create notification for destination warehouse
    const notification: Notification = {
      id: `NOTIF-${Date.now()}`,
      type: 'reroute_request',
      title: 'New Reroute Request',
      message: `${request.quantity} units of ${request.productName} requested from ${request.fromWarehouse}`,
      timestamp: new Date().toISOString(),
      read: false,
      rerouteId: newRequest.id,
      targetWarehouse: request.toWarehouse
    };

    // Send to target warehouse
    sendCrossWarehouseNotification(notification);
  }, [sendCrossWarehouseNotification]);

  const approveReroute = useCallback((id: string) => {
    setRerouteRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updatedReq = { ...req, status: 'approved' as const, approvedAt: new Date().toISOString() };
        
        // Update the source warehouse data as well
        try {
          const sourceStorageKey = `mockData_${req.fromWarehouse.toLowerCase()}`;
          const sourceData = localStorage.getItem(sourceStorageKey);
          if (sourceData) {
            const parsedSourceData = JSON.parse(sourceData);
            parsedSourceData.rerouteRequests = parsedSourceData.rerouteRequests.map((sourceReq: RerouteRequest) =>
              sourceReq.id === id ? updatedReq : sourceReq
            );
            localStorage.setItem(sourceStorageKey, JSON.stringify(parsedSourceData));
            
            // Trigger storage event for real-time updates
            window.dispatchEvent(new StorageEvent('storage', {
              key: sourceStorageKey,
              newValue: JSON.stringify(parsedSourceData)
            }));
          }
        } catch (error) {
          console.error('Error updating source warehouse data:', error);
        }
        
        // Send approval notification to source warehouse
        const notification: Notification = {
          id: `NOTIF-APPROVE-${Date.now()}`,
          type: 'reroute_approved',
          title: 'Reroute Request Approved',
          message: `Your request for ${req.quantity} units of ${req.productName} has been approved`,
          timestamp: new Date().toISOString(),
          read: false,
          rerouteId: id,
          targetWarehouse: req.fromWarehouse
        };
        sendCrossWarehouseNotification(notification);
        return updatedReq;
      }
      return req;
    }));
  }, [sendCrossWarehouseNotification]);

  const rejectReroute = useCallback((id: string) => {
    setRerouteRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updatedReq = { ...req, status: 'rejected' as const };
        
        // Update the source warehouse data as well
        try {
          const sourceStorageKey = `mockData_${req.fromWarehouse.toLowerCase()}`;
          const sourceData = localStorage.getItem(sourceStorageKey);
          if (sourceData) {
            const parsedSourceData = JSON.parse(sourceData);
            parsedSourceData.rerouteRequests = parsedSourceData.rerouteRequests.map((sourceReq: RerouteRequest) =>
              sourceReq.id === id ? updatedReq : sourceReq
            );
            localStorage.setItem(sourceStorageKey, JSON.stringify(parsedSourceData));
            
            // Trigger storage event for real-time updates
            window.dispatchEvent(new StorageEvent('storage', {
              key: sourceStorageKey,
              newValue: JSON.stringify(parsedSourceData)
            }));
          }
        } catch (error) {
          console.error('Error updating source warehouse data:', error);
        }
        
        // Send rejection notification to source warehouse
        const notification: Notification = {
          id: `NOTIF-REJECT-${Date.now()}`,
          type: 'reroute_rejected',
          title: 'Reroute Request Rejected',
          message: `Your request for ${req.quantity} units of ${req.productName} has been rejected`,
          timestamp: new Date().toISOString(),
          read: false,
          rerouteId: id,
          targetWarehouse: req.fromWarehouse
        };
        sendCrossWarehouseNotification(notification);
        return updatedReq;
      }
      return req;
    }));
  }, [sendCrossWarehouseNotification]);

  const startTransit = useCallback((id: string) => {
    setRerouteRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updatedReq = { 
          ...req, 
          status: 'in_transit' as const, 
          transitStartedAt: new Date().toISOString(),
          transitProgress: 25
        };
        
        // Update destination warehouse data as well
        try {
          const destStorageKey = `mockData_${req.toWarehouse.toLowerCase()}`;
          const destData = localStorage.getItem(destStorageKey);
          if (destData) {
            const parsedDestData = JSON.parse(destData);
            parsedDestData.rerouteRequests = parsedDestData.rerouteRequests.map((destReq: RerouteRequest) =>
              destReq.id === id ? updatedReq : destReq
            );
            localStorage.setItem(destStorageKey, JSON.stringify(parsedDestData));
            
            // Trigger storage event for real-time updates
            window.dispatchEvent(new StorageEvent('storage', {
              key: destStorageKey,
              newValue: JSON.stringify(parsedDestData)
            }));
          }
        } catch (error) {
          console.error('Error updating destination warehouse data:', error);
        }
        
        // Send transit notification to destination warehouse
        const notification: Notification = {
          id: `NOTIF-TRANSIT-${Date.now()}`,
          type: 'reroute_in_transit',
          title: 'Shipment In Transit',
          message: `${req.quantity} units of ${req.productName} are now in transit`,
          timestamp: new Date().toISOString(),
          read: false,
          rerouteId: id,
          targetWarehouse: req.toWarehouse
        };
        sendCrossWarehouseNotification(notification);
        
        // Simulate transit progress
        setTimeout(() => {
          setRerouteRequests(current => current.map(r => 
            r.id === id ? { ...r, transitProgress: 75 } : r
          ));
        }, 2000);
        
        setTimeout(() => {
          setRerouteRequests(current => current.map(r => {
            if (r.id === id) {
              const deliveredReq = { 
                ...r, 
                status: 'delivered' as const, 
                deliveredAt: new Date().toISOString(),
                transitProgress: 100
              };
              
              // Send delivery notification
              const deliveryNotification: Notification = {
                id: `NOTIF-DELIVERED-${Date.now()}`,
                type: 'reroute_delivered',
                title: 'Shipment Delivered',
                message: `${r.quantity} units of ${r.productName} have been delivered`,
                timestamp: new Date().toISOString(),
                read: false,
                rerouteId: id,
                targetWarehouse: r.toWarehouse
              };
              sendCrossWarehouseNotification(deliveryNotification);
              return deliveredReq;
            }
            return r;
          }));
        }, 5000);
        
        return updatedReq;
      }
      return req;
    }));
  }, [sendCrossWarehouseNotification]);

  const confirmDelivery = useCallback((id: string) => {
    setRerouteRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updatedReq = { 
          ...req, 
          status: 'completed' as const,
          completedAt: new Date().toISOString()
        };
        
        // Update source warehouse data as well
        try {
          const sourceStorageKey = `mockData_${req.fromWarehouse.toLowerCase()}`;
          const sourceData = localStorage.getItem(sourceStorageKey);
          if (sourceData) {
            const parsedSourceData = JSON.parse(sourceData);
            parsedSourceData.rerouteRequests = parsedSourceData.rerouteRequests.map((sourceReq: RerouteRequest) =>
              sourceReq.id === id ? updatedReq : sourceReq
            );
            localStorage.setItem(sourceStorageKey, JSON.stringify(parsedSourceData));
            
            // Trigger storage event for real-time updates
            window.dispatchEvent(new StorageEvent('storage', {
              key: sourceStorageKey,
              newValue: JSON.stringify(parsedSourceData)
            }));
          }
        } catch (error) {
          console.error('Error updating source warehouse data:', error);
        }
        
        // Send completion notification to source warehouse
        const notification: Notification = {
          id: `NOTIF-COMPLETED-${Date.now()}`,
          type: 'reroute_completed',
          title: 'Reroute Completed',
          message: `Reroute of ${req.quantity} units of ${req.productName} has been completed`,
          timestamp: new Date().toISOString(),
          read: false,
          rerouteId: id,
          targetWarehouse: req.fromWarehouse
        };
        sendCrossWarehouseNotification(notification);
        return updatedReq;
      }
      return req;
    }));
  }, [sendCrossWarehouseNotification]);

  const completeReroute = useCallback((id: string) => {
    confirmDelivery(id);
  }, [confirmDelivery]);

  // Notification methods
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SouthWarehouseContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshProducts,
      isLoading,
      insights,
      metricsData,
      rerouteRequests,
      notifications,
      addRerouteRequest,
      approveReroute,
      rejectReroute,
      startTransit,
      confirmDelivery,
      completeReroute,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount
    }}>
      {children}
    </SouthWarehouseContext.Provider>
  );
};
