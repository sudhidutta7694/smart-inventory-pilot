
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Truck, CheckCircle, XCircle, Clock, Play, Package } from "lucide-react";
import { useWarehouse } from "@/contexts/WarehouseContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const NotificationsPanel: React.FC = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    approveReroute, 
    rejectReroute,
    startTransit,
    confirmDelivery,
    rerouteRequests,
    getUnreadCountForWarehouse
  } = useWarehouse();

  const currentWarehouse = user?.warehouse || 'South';
  const unreadCount = getUnreadCountForWarehouse(currentWarehouse);

  const handleApproveReroute = (rerouteId: string, notificationId: string) => {
    approveReroute(rerouteId);
    markNotificationRead(notificationId);
    toast({
      title: "Reroute Approved",
      description: "The reroute request has been approved. Source warehouse can now start transit.",
    });
  };

  const handleRejectReroute = (rerouteId: string, notificationId: string) => {
    rejectReroute(rerouteId);
    markNotificationRead(notificationId);
    toast({
      title: "Reroute Rejected",
      description: "The reroute request has been rejected.",
      variant: "destructive"
    });
  };

  const handleStartTransit = (rerouteId: string, notificationId: string) => {
    startTransit(rerouteId);
    markNotificationRead(notificationId);
    toast({
      title: "Transit Started",
      description: "The shipment is now in transit. Tracking will begin automatically.",
    });
  };

  const handleConfirmDelivery = (rerouteId: string, notificationId: string) => {
    confirmDelivery(rerouteId);
    markNotificationRead(notificationId);
    toast({
      title: "Delivery Confirmed",
      description: "The reroute has been completed successfully.",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reroute_request':
        return <Bell className="h-4 w-4" />;
      case 'reroute_approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'reroute_transit_ready':
        return <Play className="h-4 w-4" />;
      case 'reroute_in_transit':
        return <Truck className="h-4 w-4" />;
      case 'reroute_delivered':
        return <Package className="h-4 w-4" />;
      case 'reroute_completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Filter notifications relevant to current warehouse
  const relevantNotifications = notifications
    .filter(notification => notification.targetWarehouse === currentWarehouse)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} new</Badge>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllNotificationsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {relevantNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            relevantNotifications.map((notification) => {
              const relatedRequest = rerouteRequests.find(req => req.id === notification.rerouteId);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg space-y-3 transition-all duration-200 ${
                    !notification.read 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 ${!notification.read ? 'text-primary' : 'text-muted-foreground'}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm leading-tight ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Action buttons for different notification types */}
                  {relatedRequest && (
                    <>
                      {/* Reroute request - show approve/reject */}
                      {notification.type === 'reroute_request' && relatedRequest.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleApproveReroute(notification.rerouteId!, notification.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => handleRejectReroute(notification.rerouteId!, notification.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {/* Approved - show start transit */}
                      {notification.type === 'reroute_approved' && relatedRequest.status === 'transit_prep' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleStartTransit(notification.rerouteId!, notification.id)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start Transit
                          </Button>
                        </div>
                      )}

                      {/* Delivered - show confirm delivery */}
                      {notification.type === 'reroute_delivered' && relatedRequest.status === 'delivered' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleConfirmDelivery(notification.rerouteId!, notification.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirm Receipt
                          </Button>
                        </div>
                      )}

                      {/* Show status info */}
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {relatedRequest.quantity} units
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {relatedRequest.fromWarehouse} → {relatedRequest.toWarehouse}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {relatedRequest.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </>
                  )}

                  {/* Mark as read button for unread notifications */}
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
