import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  Truck, 
  AlertCircle, 
  FileText,
  CheckCircle,
  Clock,
  Plus,
  Play,
  Package
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { NewTaskDialog } from "./NewTaskDialog";
import { useWarehouseContext } from "@/hooks/useWarehouseContext";
import { useAuth } from "@/contexts/AuthContext";
import { RerouteRequest } from "@/types/warehouse";

interface Task {
  id: string;
  title: string;
  type: 'reorder' | 'reroute' | 'flag' | 'report';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  description?: string;
  assignee?: string;
  rerouteId?: string;
  actionType?: string;
  rerouteData?: RerouteRequest;
}

const AdminTaskWindow = () => {
  const { rerouteRequests, approveReroute, rejectReroute, startTransit, confirmDelivery } = useWarehouseContext();
  const { user } = useAuth();
  const currentWarehouse = user?.warehouse || 'South';
  
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "TASK001",
      title: "Reorder Industrial Sensors",
      type: "reorder",
      priority: "high",
      status: "pending",
      dueDate: "2025-07-09"
    },
    {
      id: "TASK002", 
      title: "Reroute Pumps from South to East",
      type: "reroute",
      priority: "medium",
      status: "in-progress",
      dueDate: "2025-07-10"
    },
    {
      id: "TASK003",
      title: "Flag Overstock: Heavy Duty Pumps",
      type: "flag",
      priority: "medium",
      status: "pending",
      dueDate: "2025-07-11"
    },
    {
      id: "TASK004",
      title: "Generate Weekly Report",
      type: "report",
      priority: "low",
      status: "completed",
      dueDate: "2025-07-08"
    }
  ]);

  const handleQuickAction = (action: string) => {
    toast({
      title: "Action Initiated",
      description: `${action} process has been started`,
    });
  };

  const handleTaskAction = (taskId: string, action: 'start' | 'complete') => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: action === 'start' ? 'in-progress' : 'completed' 
          }
        : task
    ));
    
    toast({
      title: action === 'start' ? "Task Started" : "Task Completed",
      description: `Task has been ${action === 'start' ? 'started' : 'marked as completed'}`,
    });
  };

  const handleRerouteAction = (rerouteId: string, action: 'approve' | 'reject' | 'start_transit' | 'confirm_delivery') => {
    switch (action) {
      case 'approve':
        approveReroute(rerouteId);
        toast({ title: "Reroute Approved", description: "Request has been approved" });
        break;
      case 'reject':
        rejectReroute(rerouteId);
        toast({ title: "Reroute Rejected", description: "Request has been rejected", variant: "destructive" });
        break;
      case 'start_transit':
        startTransit(rerouteId);
        toast({ title: "Transit Started", description: "Shipment is now in transit" });
        break;
      case 'confirm_delivery':
        confirmDelivery(rerouteId);
        toast({ title: "Delivery Confirmed", description: "Reroute completed successfully" });
        break;
    }
  };

  const handleNewTask = (newTaskData: {
    title: string;
    type: 'reorder' | 'reroute' | 'flag' | 'report';
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
    description?: string;
    assignee?: string;
  }) => {
    const newTask: Task = {
      id: `TASK${String(Date.now()).slice(-3)}`,
      title: newTaskData.title,
      type: newTaskData.type,
      priority: newTaskData.priority,
      status: 'pending',
      dueDate: newTaskData.dueDate,
      description: newTaskData.description,
      assignee: newTaskData.assignee || 'Admin User',
    };

    setTasks(prev => [newTask, ...prev]);
    
    toast({
      title: "Task Created",
      description: `"${newTaskData.title}" has been added to your task list`,
    });
  };

  const rerouteTasks = rerouteRequests
    .filter(request => 
      request.fromWarehouse === currentWarehouse || 
      request.toWarehouse === currentWarehouse
    )
    .map(request => {
      let title = '';
      let actionType = '';
      
      if (request.fromWarehouse === currentWarehouse) {
        // Source warehouse tasks
        if (request.status === 'approved') {
          title = `Start Transit: ${request.productName} to ${request.toWarehouse}`;
          actionType = 'start_transit';
        } else if (request.status === 'pending') {
          title = `Awaiting Approval: ${request.productName} to ${request.toWarehouse}`;
          actionType = 'waiting';
        } else {
          title = `Track Shipment: ${request.productName} to ${request.toWarehouse}`;
          actionType = 'tracking';
        }
      } else {
        // Destination warehouse tasks
        if (request.status === 'pending') {
          title = `Approve Request: ${request.productName} from ${request.fromWarehouse}`;
          actionType = 'approve';
        } else if (request.status === 'delivered') {
          title = `Confirm Receipt: ${request.productName} from ${request.fromWarehouse}`;
          actionType = 'confirm_delivery';
        } else {
          title = `Monitor Incoming: ${request.productName} from ${request.fromWarehouse}`;
          actionType = 'monitoring';
        }
      }

      return {
        id: `REROUTE-${request.id}`,
        title,
        type: 'reroute' as const,
        priority: 'medium' as const,
        status: request.status === 'pending' ? 'pending' as const :
                request.status === 'completed' ? 'completed' as const : 'in-progress' as const,
        dueDate: request.estimatedDelivery ? new Date(request.estimatedDelivery).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: request.reason,
        assignee: 'Warehouse Admin',
        rerouteId: request.id,
        actionType,
        rerouteData: request
      };
    });

  const allTasks = [...tasks, ...rerouteTasks].sort((a, b) => 
    new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'reorder':
        return <RotateCcw className="h-4 w-4" />;
      case 'reroute':
        return <Truck className="h-4 w-4" />;
      case 'flag':
        return <AlertCircle className="h-4 w-4" />;
      case 'report':
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'in-progress':
        return <RotateCcw className="h-3 w-3 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in-progress':
        return 'default';
      case 'completed':
        return 'outline';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  const getRerouteActionButton = (task: Task) => {
    if (!task.rerouteId || !task.actionType) return null;

    switch (task.actionType) {
      case 'approve':
        return (
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-xs flex-1"
              onClick={() => handleRerouteAction(task.rerouteId!, 'approve')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-xs flex-1"
              onClick={() => handleRerouteAction(task.rerouteId!, 'reject')}
            >
              Reject
            </Button>
          </div>
        );
      case 'start_transit':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs"
            onClick={() => handleRerouteAction(task.rerouteId!, 'start_transit')}
          >
            <Play className="h-3 w-3 mr-1" />
            Start Transit
          </Button>
        );
      case 'confirm_delivery':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs"
            onClick={() => handleRerouteAction(task.rerouteId!, 'confirm_delivery')}
          >
            <Package className="h-3 w-3 mr-1" />
            Confirm Receipt
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="h-full shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <span>Admin Tasks</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsNewTaskDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start h-9"
                onClick={() => handleQuickAction("Reorder Stock")}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reorder Stock
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start h-9"
                onClick={() => handleQuickAction("Reroute Shipment")}
              >
                <Truck className="h-4 w-4 mr-2" />
                Reroute Shipment
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start h-9"
                onClick={() => handleQuickAction("Flag Overstock")}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Flag Overstock
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start h-9"
                onClick={() => handleQuickAction("Generate Report")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Active Tasks */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Active Tasks</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between space-x-2">
                    <div className="flex items-start space-x-2 flex-1">
                      {getTaskIcon(task.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                        {task.rerouteData && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {task.rerouteData.quantity} units
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.rerouteData.fromWarehouse} → {task.rerouteData.toWarehouse}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge 
                        variant={getPriorityColor(task.priority)}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={getStatusColor(task.status)}
                      className="text-xs"
                    >
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{task.status.replace('-', ' ')}</span>
                    </Badge>
                    
                    {/* Show appropriate action buttons */}
                    {task.rerouteId ? (
                      getRerouteActionButton(task)
                    ) : (
                      <>
                        {task.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={() => handleTaskAction(task.id, 'start')}
                          >
                            Start
                          </Button>
                        )}
                        
                        {task.status === 'in-progress' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={() => handleTaskAction(task.id, 'complete')}
                          >
                            Complete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <NewTaskDialog 
        open={isNewTaskDialogOpen}
        onOpenChange={setIsNewTaskDialogOpen}
        onTaskCreate={handleNewTask}
      />
    </>
  );
};

export default AdminTaskWindow;
