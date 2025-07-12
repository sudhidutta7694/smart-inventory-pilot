import React from 'react';
import { Bell, Truck, CheckCircle, XCircle, Clock, Play, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Notification, RerouteRequest } from "@/types/warehouse";
import { useNotificationActions } from "@/hooks/useNotificationActions";

interface NotificationItemProps {
  notification: Notification;
  relatedRequest?: RerouteRequest;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  relatedRequest 
}) => {
  const { getActionButtons, markNotificationRead } = useNotificationActions();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reroute_request':
        return <Bell className="h-4 w-4" />;
      case 'reroute_approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'reroute_rejected':
        return <XCircle className="h-4 w-4" />;
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

  return (
    <div
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

      {/* Show related request info */}
      {relatedRequest && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {relatedRequest.quantity} units
            </Badge>
            <Badge variant="outline" className="text-xs">
              {relatedRequest.fromWarehouse} → {relatedRequest.toWarehouse}
            </Badge>
            <Badge 
              variant={
                relatedRequest.status === 'pending' ? 'secondary' :
                relatedRequest.status === 'approved' ? 'default' :
                relatedRequest.status === 'in_transit' ? 'outline' :
                relatedRequest.status === 'delivered' ? 'secondary' :
                relatedRequest.status === 'completed' ? 'default' :
                'destructive'
              } 
              className="text-xs capitalize"
            >
              {relatedRequest.status.replace('_', ' ')}
            </Badge>
            {relatedRequest.transitProgress !== undefined && relatedRequest.transitProgress > 0 && (
              <Badge variant="outline" className="text-xs">
                <Truck className="h-3 w-3 mr-1" />
                {relatedRequest.transitProgress}%
              </Badge>
            )}
          </div>
          
          {/* Action buttons */}
          {getActionButtons(notification, relatedRequest)}
        </div>
      )}

      {/* Mark as read button for unread notifications */}
      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs w-full"
          onClick={() => markNotificationRead(notification.id)}
        >
          Mark as read
        </Button>
      )}
    </div>
  );
};