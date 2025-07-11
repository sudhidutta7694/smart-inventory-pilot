
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Clock,
  Target,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSupplyChainStore } from "@/stores/supplyChainStore";
import { RerouteModal } from "@/components/rerouting/RerouteModal";
import { toast } from "@/hooks/use-toast";

const EnhancedAIInsightPanel = () => {
  const navigate = useNavigate();
  const { 
    insights, 
    regeneratingInsights, 
    regenerateInsights, 
    createRerouteRequest,
    products
  } = useSupplyChainStore();
  
  const [rerouteModalOpen, setRerouteModalOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'understock':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'overstock':
        return <Package className="h-5 w-5 text-warning" />;
      case 'forecast':
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'delay':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Target className="h-5 w-5 text-primary" />;
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
        return 'secondary';
    }
  };

  const handleInsightAction = (insight: any) => {
    if (insight.cta === "Reroute Stock") {
      // Find the product related to this insight
      const product = products.find(p => insight.title.includes(p.name));
      if (product) {
        setSelectedInsight({
          ...insight,
          productId: product.id,
          productName: product.name,
          currentStock: product.stock
        });
        setRerouteModalOpen(true);
      }
    } else {
      // Handle other insight actions
      toast({
        title: "Action Initiated",
        description: `${insight.cta} process has been started for ${insight.title}`,
      });
      
      console.log(`Executing action: ${insight.cta} for insight: ${insight.title}`);
    }
  };

  const handleRerouteSubmit = (rerouteData: any) => {
    createRerouteRequest({
      productId: selectedInsight?.productId,
      productName: selectedInsight?.productName,
      fromWarehouse: selectedInsight?.zone === 'North' || selectedInsight?.zone === 'South' ? 'South' : 'East',
      toWarehouse: selectedInsight?.zone === 'North' || selectedInsight?.zone === 'South' ? 'East' : 'South',
      quantity: rerouteData.quantity,
      reason: rerouteData.reason || 'AI suggested rerouting due to overstock'
    });
    
    toast({
      title: "Reroute Request Created",
      description: `Request to reroute ${rerouteData.quantity} units has been submitted`,
    });
  };

  return (
    <>
      <Card className="h-full shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <span>AI Insights</span>
              <Badge variant="outline" className="ml-2">
                {insights.length} active
              </Badge>
            </CardTitle>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={regenerateInsights}
              disabled={regeneratingInsights}
              className="flex items-center space-x-2"
            >
              <RotateCcw className={`h-4 w-4 ${regeneratingInsights ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {regeneratingInsights ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-8 w-8 text-primary mx-auto" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">AI Analyzing...</h3>
                    <p className="text-sm text-muted-foreground">
                      Processing inventory data and generating insights
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {insights.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No insights available</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={regenerateInsights}
                      className="mt-2"
                    >
                      Generate Insights
                    </Button>
                  </div>
                ) : (
                  insights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200 space-y-3 group"
                    >
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            {getInsightIcon(insight.type)}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                              {insight.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={getPriorityColor(insight.priority) as any}
                          className="text-xs shrink-0"
                        >
                          {insight.priority.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Zone:</span> {insight.zone}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Impact:</span> {insight.impact}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            onClick={() => handleInsightAction(insight)}
                          >
                            {insight.cta}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate('/insights')}
          >
            View All Insights
          </Button>
        </CardContent>
      </Card>

      {/* Reroute Modal */}
      {selectedInsight && (
        <RerouteModal
          open={rerouteModalOpen}
          onOpenChange={setRerouteModalOpen}
          productId={selectedInsight.productId}
          productName={selectedInsight.productName}
          currentStock={selectedInsight.currentStock}
          zone={selectedInsight.zone}
          onSubmit={handleRerouteSubmit}
        />
      )}
    </>
  );
};

export default EnhancedAIInsightPanel;
