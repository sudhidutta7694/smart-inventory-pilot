import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Trash2,
  Play,
  X
} from "lucide-react";
import { useEnhancedInventory } from "@/contexts/EnhancedInventoryContext";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/stores/supplyChainStore";

const EnhancedAdminTaskWindow = () => {
  const { tasks, updateTaskStatus, deleteTask, addTask } = useEnhancedInventory();
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'reorder':
        return <ClipboardList className="h-4 w-4" />;
      case 'reroute':
        return <Play className="h-4 w-4" />;
      case 'inspection':
        return <AlertCircle className="h-4 w-4" />;
      case 'maintenance':
        return <ClipboardList className="h-4 w-4" />;
      case 'urgent':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const handleCompleteTask = (taskId: string) => {
    updateTaskStatus(taskId, 'completed');
    toast({
      title: "Task Completed",
      description: "Task has been marked as completed.",
    });
  };

  const handleStartTask = (taskId: string) => {
    updateTaskStatus(taskId, 'in_progress');
    toast({
      title: "Task Started",
      description: "Task is now in progress.",
    });
  };

  const handleCancelTask = (taskId: string) => {
    deleteTask(taskId);
    toast({
      title: "Task Cancelled",
      description: "Task has been removed.",
    });
  };

  const handleAddUrgentTask = () => {
    addTask({
      title: "Urgent: Safety Equipment Audit",
      description: "Conduct emergency safety equipment compliance check",
      priority: 'high',
      status: 'pending',
      type: 'urgent',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    
    toast({
      title: "Urgent Task Added",
      description: "Emergency safety audit task has been created.",
    });
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 0) return "Overdue";
    if (diffHours < 24) return `${diffHours}h remaining`;
    return `${Math.ceil(diffHours / 24)}d remaining`;
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5" />
            <span>Admin Tasks</span>
            <Badge variant="outline" className="ml-2">
              {activeTasks.length} active
            </Badge>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleAddUrgentTask}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <Button
            variant={!showCompleted ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowCompleted(false)}
            className="h-7"
          >
            Active ({activeTasks.length})
          </Button>
          <Button
            variant={showCompleted ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowCompleted(true)}
            className="h-7"
          >
            Completed ({completedTasks.length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          {!showCompleted ? (
            <motion.div
              key="active-tasks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {activeTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">All tasks completed!</p>
                </motion.div>
              ) : (
                activeTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 rounded-lg bg-muted">
                          {getTaskIcon(task.type)}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm line-clamp-1">{task.title}</h4>
                            <Badge 
                              variant={getPriorityColor(task.priority) as any}
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                            {getStatusIcon(task.status)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                          
                          {task.dueDate && (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDueDate(task.dueDate)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 pt-2">
                            {task.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartTask(task.id)}
                                className="h-7 text-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                            
                            {(task.status === 'pending' || task.status === 'in_progress') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompleteTask(task.id)}
                                className="h-7 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelTask(task.id)}
                              className="h-7 text-xs hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="completed-tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {completedTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed tasks yet.</p>
                </motion.div>
              ) : (
                completedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 rounded-lg bg-green-100">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm line-through opacity-70">{task.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              Completed
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground opacity-70">
                            {task.description}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              Completed on {new Date(task.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTask(task.id)}
                        className="h-7 text-xs hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default EnhancedAdminTaskWindow;