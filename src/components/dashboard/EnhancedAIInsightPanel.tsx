import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupplyChainStore } from '@/stores/supplyChainStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  RefreshCw, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Clock, 
  Zap,
  CheckCircle2,
  X 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EnhancedAIInsightPanel = () => {
  const { 
    insights, 
    isLoading, 
    regenerateInsights, 
    markInsightActioned,
    activeWarehouse 
  } = useSupplyChainStore();
  
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Filter insights for current warehouse
  const warehouseInsights = insights.filter(insight => 
    insight.zone === activeWarehouse
  );

  const handleRegenerateInsights = async () => {
    setIsRegenerating(true);
    
    // Simulate AI thinking process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    regenerateInsights(activeWarehouse);
    setIsRegenerating(false);
    
    toast({
      title: "AI Insights Regenerated",
      description: `Updated insights for ${activeWarehouse} warehouse based on current inventory data.`,
    });
  };

  const handleActionInsight = (insightId: string, action: string) => {
    markInsightActioned(insightId);
    toast({
      title: "Action Taken",
      description: `${action} action has been initiated.`,
    });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'understock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'overstock':
        return <Package className="h-4 w-4" />;
      case 'forecast':
        return <TrendingUp className="h-4 w-4" />;
      case 'delay':
        return <Clock className="h-4 w-4" />;
      case 'optimization':
        return <Zap className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
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
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
          <Badge variant="outline" className="ml-2">
            {warehouseInsights.length}
          </Badge>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerateInsights}
          disabled={isRegenerating}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Analyzing...' : 'Regenerate'}
        </Button>
      </CardHeader>
      
      <CardContent>
        {isRegenerating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="relative">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">AI Analysis in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzing inventory data and generating new insights...
                </p>
                <Progress value={65} className="mt-2" />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {warehouseInsights.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">No insights available</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your inventory levels look optimal. Click regenerate to analyze current data.
                  </p>
                  <Button variant="outline" onClick={handleRegenerateInsights}>
                    Generate Insights
                  </Button>
                </motion.div>
              ) : (
                warehouseInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{insight.title}</h3>
                          <Badge 
                            variant={getPriorityColor(insight.priority) as any}
                            className="mt-1 text-xs"
                          >
                            {insight.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markInsightActioned(insight.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <strong>Impact:</strong> {insight.impact}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleActionInsight(insight.id, insight.cta)}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {insight.cta}
                      </Button>
                    </div>
                    
                    {/* Progress indicator for some insight types */}
                    {insight.type === 'understock' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Stock Level</span>
                          <span>Critical</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAIInsightPanel;