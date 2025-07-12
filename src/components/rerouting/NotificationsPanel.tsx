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
import { Bell } from "lucide-react";
import { useWarehouseContext } from "@/hooks/useWarehouseContext";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationItem } from "./NotificationItem";

export const NotificationsPanel: React.FC = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    markAllNotificationsRead,
    rerouteRequests,
    unreadCount
  } = useWarehouseContext();

  const currentWarehouse = user?.warehouse || 'East';

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
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  relatedRequest={relatedRequest}
                />
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};