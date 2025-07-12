import { useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Play, Package } from "lucide-react";
import { useWarehouseContext } from "@/hooks/useWarehouseContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { Notification, RerouteRequest } from "@/types/warehouse";

export const useNotificationActions = () => {
  const { user } = useAuth();
  const { 
    markNotificationRead, 
    approveReroute, 
    rejectReroute,
    startTransit,
    confirmDelivery
  } = useWarehouseContext();

  const currentWarehouse = user?.warehouse || 'East';

  const handleApproveReroute = useCallback((rerouteId: string, notificationId: string) => {
    approveReroute(rerouteId);
    markNotificationRead(notificationId);
    toast({
      title: "Reroute Approved",
      description: "The reroute request has been approved. Source warehouse can now start transit.",
    });
  }, [approveReroute, markNotificationRead]);

  const handleRejectReroute = useCallback((rerouteId: string, notificationId: string) => {
    rejectReroute(rerouteId);
    markNotificationRead(notificationId);
    toast({
      title: "Reroute Rejected",
      description: "The reroute request has been rejected.",
      variant: "destructive"
    });
  }, [rejectReroute, markNotificationRead]);

  const handleStartTransit = useCallback((rerouteId: string, notificationId: string) => {
    startTransit(rerouteId);
    markNotificationRead(notificationId);
    toast({
      title: "Transit Started",
      description: "The shipment is now in transit. Tracking will begin automatically.",
    });
  }, [startTransit, markNotificationRead]);

  const handleConfirmDelivery = useCallback((rerouteId: string, notificationId: string) => {
    confirmDelivery(rerouteId);
    markNotificationRead(notificationId);
    toast({
      title: "Delivery Confirmed",
      description: "The reroute has been completed successfully.",
    });
  }, [confirmDelivery, markNotificationRead]);

  const getActionButtons = useCallback((notification: Notification, relatedRequest: RerouteRequest | undefined) => {
    if (!notification.rerouteId || !relatedRequest) return null;

    // Destination warehouse - approve/reject pending requests
    if (notification.type === 'reroute_request' && 
        relatedRequest.status === 'pending' &&
        currentWarehouse === relatedRequest.toWarehouse) {
      return (
        <div className="flex space-x-2 mt-3">
          <Button
            size="sm"
            className="h-8 text-xs flex-1"
            onClick={() => handleApproveReroute(notification.rerouteId!, notification.id)}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs flex-1"
            onClick={() => handleRejectReroute(notification.rerouteId!, notification.id)}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
      );
    }

    // Source warehouse - start transit for approved requests
    if (notification.type === 'reroute_approved' && 
        relatedRequest.status === 'approved' &&
        currentWarehouse === relatedRequest.fromWarehouse) {
      return (
        <div className="mt-3">
          <Button
            size="sm"
            className="h-8 text-xs w-full"
            onClick={() => handleStartTransit(notification.rerouteId!, notification.id)}
          >
            <Play className="h-3 w-3 mr-1" />
            Start Transit
          </Button>
        </div>
      );
    }

    // Destination warehouse - confirm delivery for delivered requests
    if (notification.type === 'reroute_delivered' && 
        relatedRequest.status === 'delivered' &&
        currentWarehouse === relatedRequest.toWarehouse) {
      return (
        <div className="mt-3">
          <Button
            size="sm"
            className="h-8 text-xs w-full"
            onClick={() => handleConfirmDelivery(notification.rerouteId!, notification.id)}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirm Receipt
          </Button>
        </div>
      );
    }

    return null;
  }, [currentWarehouse, handleApproveReroute, handleRejectReroute, handleStartTransit, handleConfirmDelivery]);

  return {
    getActionButtons,
    markNotificationRead
  };
};