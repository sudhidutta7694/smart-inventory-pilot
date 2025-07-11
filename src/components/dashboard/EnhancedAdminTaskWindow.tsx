import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupplyChainStore, type Task } from '@/stores/supplyChainStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Package,
  Truck,
  Settings,
  Search,
  Trash2,
  Calendar
} from 'lucide-react';
import { NewTaskDialog } from '@/components/dashboard/NewTaskDialog';
import { toast } from '@/hooks/use-toast';

const EnhancedAdminTaskWindow = () => {
  const { 
    tasks, 
    isLoading, 
    addTask, 
    updateTask, 
    deleteTask, 
    completeTask,
    activeWarehouse 
  } = useSupplyChainStore();
  
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Filter tasks for current warehouse
  const warehouseTasks = tasks.filter(task => task.warehouse === activeWarehouse);
  
  // Group tasks by status
  const pendingTasks = warehouseTasks.filter(task => task.status === 'pending');
  const inProgressTasks = warehouseTasks.filter(task => task.status === 'in_progress');
  const completedTasks = warehouseTasks.filter(task => task.status === 'completed');

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'restock':
        return <Package className="h-4 w-4" />;
      case 'reroute':
        return <Truck className="h-4 w-4" />;
      case 'maintenance':
        return <Settings className="h-4 w-4" />;
      case 'quality':
        return <Search className="h-4 w-4" />;
      case 'audit':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in_progress':
        return 'outline';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    toast({
      title: "Task Completed",
      description: "Task has been marked as completed successfully.",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast({
      title: "Task Deleted",
      description: "Task has been deleted successfully.",
    });
  };

  const handleStartTask = (taskId: string) => {
    updateTask(taskId, { status: 'in_progress' });
    toast({
      title: "Task Started",
      description: "Task is now in progress.",
    });
  };

  const calculateDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const daysUntilDue = calculateDaysUntilDue(task.dueDate);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/10 text-primary">
              {getTaskIcon(task.type)}
            </div>
            <div>
              <h3 className="font-medium text-sm">{task.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={getPriorityColor(task.priority) as any}
                  className="text-xs"
                >
                  {task.priority.toUpperCase()}
                </Badge>
                <Badge 
                  variant={getStatusColor(task.status) as any}
                  className="text-xs"
                >
                  {task.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteTask(task.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          {task.description}
        </p>
        
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Calendar className="h-3 w-3" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            {daysUntilDue !== null && (
              <Badge 
                variant={daysUntilDue < 0 ? 'destructive' : daysUntilDue <= 1 ? 'secondary' : 'default'}
                className="ml-2"
              >
                {daysUntilDue < 0 ? 'Overdue' : 
                 daysUntilDue === 0 ? 'Due Today' : 
                 daysUntilDue === 1 ? 'Due Tomorrow' : 
                 `${daysUntilDue} days`}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          {task.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStartTask(task.id)}
              className="flex items-center gap-1"
            >
              <Clock className="h-3 w-3" />
              Start
            </Button>
          )}
          {(task.status === 'pending' || task.status === 'in_progress') && (
            <Button
              size="sm"
              onClick={() => handleCompleteTask(task.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Complete
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Admin Tasks
          <Badge variant="outline" className="ml-2">
            {warehouseTasks.length}
          </Badge>
        </CardTitle>
        <Button
          size="sm"
          onClick={() => setNewTaskDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              In Progress ({inProgressTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4 mt-4">
            <AnimatePresence>
              {pendingTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">No pending tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    All tasks are up to date. Create a new task to get started.
                  </p>
                </motion.div>
              ) : (
                pendingTasks
                  .sort((a, b) => {
                    // Sort by priority first, then by due date
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - 
                                       priorityOrder[a.priority as keyof typeof priorityOrder];
                    if (priorityDiff !== 0) return priorityDiff;
                    
                    if (a.dueDate && b.dueDate) {
                      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    }
                    return 0;
                  })
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
              )}
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="in_progress" className="space-y-4 mt-4">
            <AnimatePresence>
              {inProgressTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">No tasks in progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Start working on pending tasks to see them here.
                  </p>
                </motion.div>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4 mt-4">
            <AnimatePresence>
              {completedTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">No completed tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    Completed tasks will appear here.
                  </p>
                </motion.div>
              ) : (
                completedTasks
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <NewTaskDialog
        open={newTaskDialogOpen}
        onOpenChange={setNewTaskDialogOpen}
        onSave={(taskData) => {
          addTask({
            ...taskData,
            warehouse: activeWarehouse,
            description: taskData.description || ''
          });
          toast({
            title: "Task Created", 
            description: "New task has been created successfully.",
          });
        }}
      />
    </Card>
  );
};

export default EnhancedAdminTaskWindow;