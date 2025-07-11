import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupplyChainStore } from '@/stores/supplyChainStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  Truck, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause,
  RefreshCw,
  MapPin,
  Calendar,
  ArrowRight
} from 'lucide-react';

const EnhancedReroutingStatus = () => {
  const { 
    reroutes, 
    products,
    activeWarehouse,
    createRerouteRequest,
    approveReroute,
    rejectReroute,
    startTransit,
    confirmDelivery,
    isLoading 
  } = useSupplyChainStore();

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('');

  // Filter reroutes based on active warehouse and status
  const filteredReroutes = reroutes.filter(reroute => {
    const warehouseMatch = reroute.fromWarehouse === activeWarehouse || 
                          reroute.toWarehouse === activeWarehouse;
    const statusMatch = selectedStatus === 'all' || reroute.status === selectedStatus;
    return warehouseMatch && statusMatch;
  });

  // Group reroutes by status
  const pendingReroutes = filteredReroutes.filter(r => r.status === 'pending');
  const approvedReroutes = filteredReroutes.filter(r => r.status === 'transit_prep');
  const inTransitReroutes = filteredReroutes.filter(r => r.status === 'in_transit');
  const deliveredReroutes = filteredReroutes.filter(r => r.status === 'delivered');
  const completedReroutes = filteredReroutes.filter(r => r.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'outline';
      case 'transit_prep': return 'outline';
      case 'in_transit': return 'default';
      case 'delivered': return 'outline';
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved':
      case 'transit_prep': return <Play className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateReroute = () => {
    if (!selectedProduct) {
      toast({
        title: "Selection Required",
        description: "Please select a product to reroute.",
        variant: "destructive"
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const toWarehouse = activeWarehouse === 'South' ? 'East' : 'South';
    const maxQuantity = Math.floor(product.stock * 0.3); // Max 30% of stock

    createRerouteRequest({
      productId: product.id,
      productName: product.name,
      fromWarehouse: activeWarehouse,
      toWarehouse,
      quantity: Math.max(1, maxQuantity),
      reason: 'Stock rebalancing - optimizing inventory distribution',
      status: 'pending'
    });

    toast({
      title: "Reroute Request Created",
      description: `Request to transfer ${product.name} to ${toWarehouse} warehouse has been submitted.`,
    });
  };

  const handleApprove = (rerouteId: string) => {
    approveReroute(rerouteId);
    toast({
      title: "Reroute Approved",
      description: "The reroute request has been approved and is ready for transit.",
    });
  };

  const handleReject = (rerouteId: string) => {
    rejectReroute(rerouteId);
    toast({
      title: "Reroute Rejected",
      description: "The reroute request has been rejected.",
      variant: "destructive"
    });
  };

  const handleStartTransit = (rerouteId: string) => {
    startTransit(rerouteId);
    toast({
      title: "Transit Started",
      description: "The shipment is now in transit.",
    });
  };

  const handleConfirmDelivery = (rerouteId: string) => {
    confirmDelivery(rerouteId);
    toast({
      title: "Delivery Confirmed",
      description: "The reroute has been completed successfully.",
    });
  };

  const RerouteCard = ({ reroute }: { reroute: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            {getStatusIcon(reroute.status)}
          </div>
          <div>
            <h3 className="font-medium">{reroute.productName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusColor(reroute.status) as any} className="text-xs">
                {reroute.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {reroute.quantity} units
              </span>
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {reroute.fromWarehouse} → {reroute.toWarehouse}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{reroute.reason}</p>

      {/* Transit Progress */}
      {reroute.status === 'in_transit' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Transit Progress</span>
            <span>{Math.round(reroute.transitProgress || 0)}%</span>
          </div>
          <Progress value={reroute.transitProgress || 0} className="h-2" />
          {reroute.estimatedDelivery && (
            <p className="text-xs text-muted-foreground mt-1">
              ETA: {new Date(reroute.estimatedDelivery).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-2 mb-4">
        {reroute.requestedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Requested: {new Date(reroute.requestedAt).toLocaleString()}</span>
          </div>
        )}
        {reroute.approvedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" />
            <span>Approved: {new Date(reroute.approvedAt).toLocaleString()}</span>
          </div>
        )}
        {reroute.transitStartedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-3 w-3" />
            <span>In Transit: {new Date(reroute.transitStartedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {reroute.status === 'pending' && reroute.toWarehouse === activeWarehouse && (
          <>
            <Button
              size="sm"
              onClick={() => handleApprove(reroute.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(reroute.id)}
              className="flex items-center gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              Reject
            </Button>
          </>
        )}
        
        {reroute.status === 'transit_prep' && reroute.fromWarehouse === activeWarehouse && (
          <Button
            size="sm"
            onClick={() => handleStartTransit(reroute.id)}
            className="flex items-center gap-1"
          >
            <Play className="h-3 w-3" />
            Start Transit
          </Button>
        )}
        
        {reroute.status === 'delivered' && reroute.toWarehouse === activeWarehouse && (
          <Button
            size="sm"
            onClick={() => handleConfirmDelivery(reroute.id)}
            className="flex items-center gap-1"
          >
            <CheckCircle2 className="h-3 w-3" />
            Confirm Receipt
          </Button>
        )}
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Rerouting Status
            <Badge variant="outline" className="ml-2">
              {filteredReroutes.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select product to reroute" />
              </SelectTrigger>
              <SelectContent>
                {products
                  .filter(p => p.zone === activeWarehouse && p.stock > 10)
                  .map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.stock} units)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreateReroute} className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Create Reroute
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({filteredReroutes.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingReroutes.length})</TabsTrigger>
              <TabsTrigger value="transit_prep">Ready ({approvedReroutes.length})</TabsTrigger>
              <TabsTrigger value="in_transit">Transit ({inTransitReroutes.length})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({deliveredReroutes.length})</TabsTrigger>
              <TabsTrigger value="completed">Complete ({completedReroutes.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedStatus} className="space-y-4 mt-6">
              <AnimatePresence>
                {filteredReroutes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-muted-foreground mb-2">No reroutes found</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a new reroute request to get started.
                    </p>
                  </motion.div>
                ) : (
                  filteredReroutes
                    .sort((a, b) => new Date(b.requestedAt || '').getTime() - 
                                   new Date(a.requestedAt || '').getTime())
                    .map((reroute) => (
                      <RerouteCard key={reroute.id} reroute={reroute} />
                    ))
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedReroutingStatus;