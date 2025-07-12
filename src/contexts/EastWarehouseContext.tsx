import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products as initialProducts, insights as initialInsights, type Product, type Insight, type MetricData, metricsData as initialMetricsData } from '@/data/mockData';
import { RerouteRequest, Notification } from '@/types/warehouse';

interface EastWarehouseContextType {
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

const EastWarehouseContext = createContext<EastWarehouseContextType | undefined>(undefined);

export const useEastWarehouse = () => {
  const context = useContext(EastWarehouseContext);
  if (!context) {
    throw new Error('useEastWarehouse must be used within an EastWarehouseProvider');
  }
  return context;
};

const EAST_STORAGE_KEY = 'mockData_east';

export const EastWarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [rerouteRequests, setRerouteRequests] = useState<RerouteRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage or initialize with defaults
  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(EAST_STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setProducts(parsedData.products || initialProducts.filter(p => p.zone === 'East'));
        setInsights(parsedData.insights || initialInsights.filter(i => i.zone === 'East'));
        setMetricsData(parsedData.metricsData || initialMetricsData);
        setRerouteRequests(parsedData.rerouteRequests || []);
        setNotifications(parsedData.notifications || []);
      } else {
        // Initialize with East-specific data
        const eastProducts = initialProducts.filter(p => p.zone === 'East');
        const eastInsights = initialInsights.filter(i => i.zone === 'East');
        setProducts(eastProducts);
        setInsights(eastInsights);
        setMetricsData(initialMetricsData);
        setRerouteRequests([]);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading East warehouse data:', error);
      setProducts(initialProducts.filter(p => p.zone === 'East'));
      setInsights(initialInsights.filter(i => i.zone === 'East'));
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
      localStorage.setItem(EAST_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving East warehouse data:', error);
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

  // Rerouting methods
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
    setNotifications(prev => [...prev, notification]);
  }, []);

  const approveReroute = useCallback((id: string) => {
    setRerouteRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: 'transit_prep' as const, approvedAt: new Date().toISOString() }
        : req
    ));
  }, []);

  const rejectReroute = useCallback((id: string) => {
    setRerouteRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  }, []);

  const startTransit = useCallback((id: string) => {
    setRerouteRequests(prev => prev.map(req => 
      req.id === id 
        ? { 
            ...req, 
            status: 'in_transit' as const, 
            transitStartedAt: new Date().toISOString(),
            transitProgress: 0
          }
        : req
    ));
  }, []);

  const confirmDelivery = useCallback((id: string) => {
    setRerouteRequests(prev => prev.map(req => 
      req.id === id 
        ? { 
            ...req, 
            status: 'completed' as const,
            completedAt: new Date().toISOString()
          }
        : req
    ));
  }, []);

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
    <EastWarehouseContext.Provider value={{
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
    </EastWarehouseContext.Provider>
  );
};
