
export interface RerouteRequest {
  id: string;
  productId: string;
  productName: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'transit_prep' | 'in_transit' | 'delivered' | 'completed';
  reason: string;
  requestedAt: string;
  approvedAt?: string;
  transitStartedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  estimatedDelivery?: string;
  transitProgress?: number;
}

export interface Notification {
  id: string;
  type: 'reroute_request' | 'approval_required' | 'transit_update' | 'delivery_confirmed';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  rerouteId?: string;
  targetWarehouse: string;
}
