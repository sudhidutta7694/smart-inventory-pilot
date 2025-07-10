
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
import { Bell, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { useWarehouse } from "@/contexts/WarehouseContext";
import { toast } from "@/hooks/use-toast";

export const NotificationsPanel: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markNotificationRead, 
    approveReroute, 
    rejectReroute,
    rerouteRequests,
    currentWarehouse
  } = useWarehouse();

  const handleApproveReroute = (rerouteId: string, notificationId: string) => {
    approveReroute(rerouteId);
    markNotificationRead(notificationId);
    toast({
      title: "Reroute Approved",
      description: "The reroute request has been approved and is now in progress.",
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reroute_request':
        return <Truck className="h-4 w-4" />;
      case 'reroute_approved':
        return <CheckCircle className="h-4 w-4" />;
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
  const relevantNotifications = notifications.filter(notification => {
    if (notification.type === 'reroute_request') {
      const request = rerouteRequests.find(req => req.id === notification.rerouteId);
      return request?.toWarehouse === currentWarehouse;
    }
    if (notification.type === 'reroute_approved' || notification.type === 'reroute_completed') {
      const request = rerouteRequests.find(req => req.id === notification.rerouteId);
      return request?.fromWarehouse === currentWarehouse;
    }
    return true;
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
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
                  className={`p-4 border rounded-lg space-y-3 ${
                    !notification.read ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-primary mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    )}
                  </div>

                  {/* Show action buttons for reroute requests */}
                  {notification.type === 'reroute_request' && 
                   relatedRequest && 
                   relatedRequest.status === 'pending' && (
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

                  {/* Show status for other notification types */}
                  {relatedRequest && notification.type !== 'reroute_request' && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {relatedRequest.quantity} units
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {relatedRequest.fromWarehouse} → {relatedRequest.toWarehouse}
                      </Badge>
                    </div>
                  )}

                  {/* Mark as read button */}
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
