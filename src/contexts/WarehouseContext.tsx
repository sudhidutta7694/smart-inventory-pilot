
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RerouteRequest {
  id: string;
  productId: string;
  productName: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  status: 'pending' | 'approved' | 'transit_prep' | 'in_transit' | 'delivered' | 'completed' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  transitStartedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  estimatedDelivery?: string;
  reason: string;
  transitProgress?: number;
}

export interface Notification {
  id: string;
  type: 'reroute_request' | 'reroute_approved' | 'reroute_transit_ready' | 'reroute_in_transit' | 'reroute_delivered' | 'reroute_completed';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  rerouteId?: string;
  targetWarehouse?: string;
}

interface WarehouseContextType {
  currentWarehouse: string;
  setCurrentWarehouse: (warehouse: string) => void;
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
  getUnreadCountForWarehouse: (warehouse: string) => number;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWarehouse, setCurrentWarehouse] = useState('South');
  const [rerouteRequests, setRerouteRequests] = useState<RerouteRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('rerouteRequests');
    const savedNotifications = localStorage.getItem('notifications');
    
    if (savedRequests) {
      setRerouteRequests(JSON.parse(savedRequests));
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('rerouteRequests', JSON.stringify(rerouteRequests));
  }, [rerouteRequests]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Real-time transit simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRerouteRequests(prev => prev.map(request => {
        if (request.status === 'in_transit' && request.transitStartedAt) {
          const startTime = new Date(request.transitStartedAt).getTime();
          const now = Date.now();
          const elapsed = now - startTime;
          const totalTransitTime = 2 * 60 * 1000; // 2 minutes for demo
          const progress = Math.min((elapsed / totalTransitTime) * 100, 100);
          
          if (progress >= 100 && request.status === 'in_transit') {
            // Auto-transition to delivered after transit completes
            const deliveredRequest = {
              ...request,
              status: 'delivered' as const,
              deliveredAt: new Date().toISOString(),
              transitProgress: 100
            };

            // Create delivery notification
            const deliveryNotification: Notification = {
              id: `NOTIF-${Date.now()}`,
              type: 'reroute_delivered',
              title: 'Reroute Delivered',
              message: `${request.productName} has arrived at ${request.toWarehouse} warehouse`,
              timestamp: new Date().toISOString(),
              read: false,
              rerouteId: request.id,
              targetWarehouse: request.toWarehouse
            };

            setNotifications(prev => [...prev, deliveryNotification]);
            return deliveredRequest;
          }
          
          return { ...request, transitProgress: progress };
        }
        return request;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addRerouteRequest = (request: Omit<RerouteRequest, 'id' | 'requestedAt'>) => {
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
  };

  const approveReroute = (id: string) => {
    setRerouteRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: 'transit_prep' as const, approvedAt: new Date().toISOString() }
        : req
    ));

    const request = rerouteRequests.find(req => req.id === id);
    if (request) {
      // Create approval notification for source warehouse
      const approvalNotification: Notification = {
        id: `NOTIF-${Date.now()}`,
        type: 'reroute_approved',
        title: 'Reroute Request Approved',
        message: `Your reroute request for ${request.productName} has been approved. Ready to start transit?`,
        timestamp: new Date().toISOString(),
        read: false,
        rerouteId: id,
        targetWarehouse: request.fromWarehouse
      };

      setNotifications(prev => [...prev, approvalNotification]);
    }
  };

  const rejectReroute = (id: string) => {
    setRerouteRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const startTransit = (id: string) => {
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

    const request = rerouteRequests.find(req => req.id === id);
    if (request) {
      // Create transit notification for destination warehouse
      const transitNotification: Notification = {
        id: `NOTIF-${Date.now()}`,
        type: 'reroute_in_transit',
        title: 'Reroute In Transit',
        message: `${request.productName} is now in transit to your warehouse`,
        timestamp: new Date().toISOString(),
        read: false,
        rerouteId: id,
        targetWarehouse: request.toWarehouse
      };

      setNotifications(prev => [...prev, transitNotification]);
    }
  };

  const confirmDelivery = (id: string) => {
    setRerouteRequests(prev => prev.map(req => 
      req.id === id 
        ? { 
            ...req, 
            status: 'completed' as const,
            completedAt: new Date().toISOString()
          }
        : req
    ));

    const request = rerouteRequests.find(req => req.id === id);
    if (request) {
      // Create completion notification for source warehouse
      const completionNotification: Notification = {
        id: `NOTIF-${Date.now()}`,
        type: 'reroute_completed',
        title: 'Reroute Completed',
        message: `${request.productName} has been successfully delivered to ${request.toWarehouse}`,
        timestamp: new Date().toISOString(),
        read: false,
        rerouteId: id,
        targetWarehouse: request.fromWarehouse
      };

      setNotifications(prev => [...prev, completionNotification]);
    }
  };

  const completeReroute = (id: string) => {
    confirmDelivery(id);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getUnreadCountForWarehouse = (warehouse: string) => {
    return notifications.filter(n => 
      !n.read && n.targetWarehouse === warehouse
    ).length;
  };

  return (
    <WarehouseContext.Provider value={{
      currentWarehouse,
      setCurrentWarehouse,
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
      unreadCount,
      getUnreadCountForWarehouse
    }}>
      {children}
    </WarehouseContext.Provider>
  );
};
