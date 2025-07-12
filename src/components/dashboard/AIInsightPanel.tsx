
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Clock,
  Target,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { insights, type Insight } from "@/data/mockData";
import { RerouteModal } from "@/components/rerouting/RerouteModal";
import { useState } from "react";

const AIInsightPanel = () => {
  const navigate = useNavigate();
  const [rerouteModalOpen, setRerouteModalOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const getInsightIcon = (type: Insight['type']) => {
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

  const getPriorityColor = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary'; // Will style as warning in CSS
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleInsightAction = (insight: Insight) => {
    if (insight.cta === "Reroute Stock") {
      setSelectedInsight(insight);
      setRerouteModalOpen(true);
    } else {
      // Handle other insight actions
      console.log(`Executing action: ${insight.cta} for insight: ${insight.title}`);
    }
  };

  return (
    <>
      <Card className="h-full shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow duration-200 space-y-3"
            >
              <div className="flex items-start justify-between space-x-3">
                <div className="flex items-start space-x-3 flex-1">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm leading-tight">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
                <Badge 
                  variant={getPriorityBadgeVariant(insight.priority)}
                  className={`text-xs ${
                    insight.priority === 'medium' ? 'bg-warning text-warning-foreground' : ''
                  }`}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={() => handleInsightAction(insight)}
                >
                  {insight.cta}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
          
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
          productId="SKU002" // Mock product ID for Heavy Duty Pumps
          productName="Heavy Duty Pumps HD-500"
          currentStock={342}
          zone={selectedInsight.zone}
        />
      )}
    </>
  );
};

export default AIInsightPanel;
