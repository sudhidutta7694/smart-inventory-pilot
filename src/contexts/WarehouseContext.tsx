
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RerouteRequest {
  id: string;
  productId: string;
  productName: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  requestedAt: string;
  approvedAt?: string;
  estimatedDelivery?: string;
  reason: string;
}

export interface Notification {
  id: string;
  type: 'reroute_request' | 'reroute_approved' | 'reroute_completed';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  rerouteId?: string;
}

interface WarehouseContextType {
  currentWarehouse: string;
  setCurrentWarehouse: (warehouse: string) => void;
  rerouteRequests: RerouteRequest[];
  notifications: Notification[];
  addRerouteRequest: (request: Omit<RerouteRequest, 'id' | 'requestedAt'>) => void;
  approveReroute: (id: string) => void;
  rejectReroute: (id: string) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
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

  const addRerouteRequest = (request: Omit<RerouteRequest, 'id' | 'requestedAt'>) => {
    const newRequest: RerouteRequest = {
      ...request,
      id: `REQ-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
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
      rerouteId: newRequest.id
    };

    setNotifications(prev => [...prev, notification]);
  };

  const approveReroute = (id: string) => {
    setRerouteRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: 'approved' as const, approvedAt: new Date().toISOString() }
        : req
    ));

    // Create approval notification
    const request = rerouteRequests.find(req => req.id === id);
    if (request) {
      const notification: Notification = {
        id: `NOTIF-${Date.now()}`,
        type: 'reroute_approved',
        title: 'Reroute Request Approved',
        message: `Your reroute request for ${request.productName} has been approved`,
        timestamp: new Date().toISOString(),
        read: false,
        rerouteId: id
      };

      setNotifications(prev => [...prev, notification]);
    }
  };

  const rejectReroute = (id: string) => {
    setRerouteRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <WarehouseContext.Provider value={{
      currentWarehouse,
      setCurrentWarehouse,
      rerouteRequests,
      notifications,
      addRerouteRequest,
      approveReroute,
      rejectReroute,
      markNotificationRead,
      unreadCount
    }}>
      {children}
    </WarehouseContext.Provider>
  );
};
