
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ArrowRight,
  AlertCircle,
  Play,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { useWarehouse } from "@/contexts/WarehouseContext";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";

const ReroutingStatus: React.FC = () => {
  const { rerouteRequests } = useWarehouse();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
      case 'transit_prep':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
      case 'completed':
        return <Package className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
      case 'transit_prep':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in_transit':
        return 'default';
      case 'delivered':
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'transit_prep':
        return 'Ready for Transit';
      case 'in_transit':
        return 'In Transit';
      default:
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const filteredRequests = rerouteRequests.filter(request => {
    const matchesSearch = request.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.fromWarehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.toWarehouse.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimelineSteps = (request: any) => {
    const steps = [
      { 
        label: 'Request Created', 
        completed: true, 
        timestamp: request.requestedAt,
        active: request.status === 'pending'
      },
      { 
        label: 'Approved', 
        completed: ['approved', 'transit_prep', 'in_transit', 'delivered', 'completed'].includes(request.status), 
        timestamp: request.approvedAt,
        active: request.status === 'approved' || request.status === 'transit_prep'
      },
      { 
        label: 'In Transit', 
        completed: ['in_transit', 'delivered', 'completed'].includes(request.status), 
        timestamp: request.transitStartedAt,
        active: request.status === 'in_transit'
      },
      { 
        label: 'Delivered', 
        completed: ['delivered', 'completed'].includes(request.status), 
        timestamp: request.deliveredAt,
        active: request.status === 'delivered'
      },
      { 
        label: 'Completed', 
        completed: request.status === 'completed', 
        timestamp: request.completedAt,
        active: request.status === 'completed'
      }
    ];
    return steps;
  };

  const getTransitProgress = (request: any) => {
    if (request.status === 'in_transit' && request.transitProgress !== undefined) {
      return request.transitProgress;
    }
    if (request.status === 'delivered' || request.status === 'completed') {
      return 100;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">{user?.warehouse} Warehouse - Rerouting Status</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Rerouting Status</h1>
              <p className="text-muted-foreground">Track all stock rerouting operations in real-time</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by product, warehouse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="transit_prep">Ready for Transit</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reroute Requests List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reroute requests found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm || statusFilter !== 'all' 
                      ? "Try adjusting your search or filter criteria" 
                      : "Create your first reroute request from the AI Insights panel"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{request.productName}</CardTitle>
                        <Badge variant={getStatusColor(request.status) as any} className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span>{getStatusLabel(request.status)}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Route Information */}
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-semibold">{request.fromWarehouse}</p>
                            <p className="text-xs text-muted-foreground">From</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="text-center">
                            <p className="font-semibold">{request.toWarehouse}</p>
                            <p className="text-xs text-muted-foreground">To</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold">{request.quantity} units</p>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                        </div>
                      </div>

                      {/* Transit Progress */}
                      {request.status === 'in_transit' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Transit Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(getTransitProgress(request))}%
                            </span>
                          </div>
                          <Progress value={getTransitProgress(request)} className="h-2" />
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="flex items-center"
                            >
                              <Truck className="h-3 w-3 mr-1" />
                              <span>In Transit</span>
                            </motion.div>
                            <span>•</span>
                            <span>ETA: {Math.ceil((100 - getTransitProgress(request)) / 50)} min</span>
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Progress Timeline</h4>
                        <div className="space-y-2">
                          {getTimelineSteps(request).map((step, index) => (
                            <motion.div 
                              key={index} 
                              className="flex items-center space-x-3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                                step.completed 
                                  ? 'bg-primary border-primary' 
                                  : step.active
                                  ? 'bg-primary/20 border-primary animate-pulse'
                                  : 'border-muted-foreground'
                              }`} />
                              <div className="flex-1 flex items-center justify-between">
                                <span className={`text-sm ${
                                  step.completed 
                                    ? 'text-foreground font-medium' 
                                    : step.active
                                    ? 'text-primary font-medium'
                                    : 'text-muted-foreground'
                                }`}>
                                  {step.label}
                                </span>
                                {step.timestamp && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(step.timestamp)}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center justify-between text-sm border-t pt-4">
                        <div className="space-y-1">
                          <p><span className="font-medium">Request ID:</span> {request.id}</p>
                          <p><span className="font-medium">Reason:</span> {request.reason}</p>
                          {request.estimatedDelivery && (
                            <p><span className="font-medium">Est. Delivery:</span> {formatDate(request.estimatedDelivery)}</p>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReroutingStatus;
