import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  Zap,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { useEnhancedInventory } from "@/contexts/EnhancedInventoryContext";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const EnhancedAIInsightPanel = () => {
  const { insights, regenerateInsights } = useEnhancedInventory();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'understock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'overstock':
        return <Package className="h-4 w-4" />;
      case 'forecast':
        return <TrendingUp className="h-4 w-4" />;
      case 'delay':
        return <TrendingDown className="h-4 w-4" />;
      case 'optimization':
        return <Zap className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
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
        return 'outline';
    }
  };

  const handleRegenerateInsights = async () => {
    setIsRegenerating(true);
    
    // Add a realistic thinking delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    regenerateInsights();
    setIsRegenerating(false);
    
    toast({
      title: "AI Insights Regenerated",
      description: "Fresh insights have been generated based on current inventory data.",
    });
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Insights</span>
            <Badge variant="outline" className="ml-2">
              {insights.length} insights
            </Badge>
          </CardTitle>
          
          <Button 
            onClick={handleRegenerateInsights}
            variant="outline"
            size="sm"
            disabled={isRegenerating}
            className="h-8"
          >
            {isRegenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                </motion.div>
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                <span>Regenerate</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {isRegenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 space-y-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className="h-12 w-12 text-primary" />
              </motion.div>
              <p className="text-sm text-muted-foreground text-center">
                AI is analyzing current inventory patterns and generating insights...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="insights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {insights.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No insights available. Try regenerating to get fresh AI analysis.
                  </p>
                </motion.div>
              ) : (
                insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 rounded-lg bg-muted">
                          {getInsightIcon(insight.type)}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm line-clamp-1">{insight.title}</h4>
                            <Badge 
                              variant={getPriorityColor(insight.priority) as any}
                              className="text-xs"
                            >
                              {insight.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {insight.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {insight.zone}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {insight.impact}
                              </span>
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {insight.cta}
                            </Button>
                          </div>
                        </div>
                      </div>
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

export default EnhancedAIInsightPanel;