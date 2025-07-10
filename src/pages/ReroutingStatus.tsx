
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertCircle
} from "lucide-react";
import { useWarehouse } from "@/contexts/WarehouseContext";
import Sidebar from "@/components/dashboard/Sidebar";

const ReroutingStatus: React.FC = () => {
  const { rerouteRequests } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in-progress':
        return 'default';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
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
      { label: 'Request Created', completed: true, timestamp: request.requestedAt },
      { label: 'Awaiting Approval', completed: request.status !== 'pending', timestamp: request.approvedAt },
      { label: 'In Transit', completed: ['in-progress', 'completed'].includes(request.status), timestamp: null },
      { label: 'Delivered', completed: request.status === 'completed', timestamp: null }
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Rerouting Status</h1>
              <p className="text-muted-foreground">Track all stock rerouting operations</p>
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
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{request.productName}</CardTitle>
                      <Badge variant={getStatusColor(request.status) as any} className="flex items-center space-x-1">
                        {getStatusIcon(request.status)}
                        <span className="capitalize">{request.status.replace('-', ' ')}</span>
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

                    {/* Timeline */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Progress Timeline</h4>
                      <div className="space-y-2">
                        {getTimelineSteps(request).map((step, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full border-2 ${
                              step.completed 
                                ? 'bg-primary border-primary' 
                                : 'border-muted-foreground'
                            }`} />
                            <div className="flex-1 flex items-center justify-between">
                              <span className={`text-sm ${
                                step.completed ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {step.label}
                              </span>
                              {step.timestamp && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(step.timestamp)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-sm">
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
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReroutingStatus;
