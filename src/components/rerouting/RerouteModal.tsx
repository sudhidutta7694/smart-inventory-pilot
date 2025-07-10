
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Radar,
  Calculator,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  Truck,
  AlertCircle
} from "lucide-react";
import { useWarehouse } from "@/contexts/WarehouseContext";
import { toast } from "@/hooks/use-toast";

interface RerouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  currentStock: number;
  zone: string;
}

interface EvaluationCriteria {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  status: 'pending' | 'evaluating' | 'completed';
}

export const RerouteModal: React.FC<RerouteModalProps> = ({
  open,
  onOpenChange,
  productId,
  productName,
  currentStock,
  zone
}) => {
  const { addRerouteRequest } = useWarehouse();
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([
    {
      id: 'demand',
      label: 'Demand Forecast',
      icon: <Radar className="h-4 w-4" />,
      value: '+350% spike predicted',
      status: 'pending'
    },
    {
      id: 'stock',
      label: 'Current Stock Levels',
      icon: <Calculator className="h-4 w-4" />,
      value: '65 units deficit',
      status: 'pending'
    },
    {
      id: 'distance',
      label: 'Shipment Route',
      icon: <MapPin className="h-4 w-4" />,
      value: '1.2 days delivery',
      status: 'pending'
    },
    {
      id: 'timeline',
      label: 'Replenishment Timeline',
      icon: <Clock className="h-4 w-4" />,
      value: '3 days current lead time',
      status: 'pending'
    },
    {
      id: 'cost',
      label: 'Handling Cost',
      icon: <DollarSign className="h-4 w-4" />,
      value: '$12.50 per unit',
      status: 'pending'
    }
  ]);

  const startAnalysis = async () => {
    setPhase('analyzing');
    setProgress(0);

    // Simulate AI analysis with progressive updates
    for (let i = 0; i < criteria.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setCriteria(prev => prev.map((item, index) => {
        if (index === i) return { ...item, status: 'evaluating' };
        if (index < i) return { ...item, status: 'completed' };
        return item;
      }));
      
      setProgress((i + 1) * 20);
    }

    // Complete analysis
    await new Promise(resolve => setTimeout(resolve, 800));
    setCriteria(prev => prev.map(item => ({ ...item, status: 'completed' })));
    setProgress(100);
    setSelectedWarehouse('East');
    setPhase('completed');
  };

  const sendRerouteRequest = () => {
    const quantity = Math.min(50, currentStock);
    
    addRerouteRequest({
      productId,
      productName,
      fromWarehouse: zone,
      toWarehouse: selectedWarehouse,
      quantity,
      status: 'pending',
      reason: 'AI-recommended redistribution due to demand spike'
    });

    toast({
      title: "Reroute Request Sent",
      description: `Request sent to ${selectedWarehouse} warehouse. Awaiting approval.`,
    });

    onOpenChange(false);
    resetModal();
  };

  const resetModal = () => {
    setPhase('idle');
    setProgress(0);
    setSelectedWarehouse('');
    setCriteria(prev => prev.map(item => ({ ...item, status: 'pending' })));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Radar className="h-5 w-5 text-primary" />
            </div>
            <span>AI Reroute Recommendation Engine</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">{productName}</h3>
            <p className="text-sm text-muted-foreground">
              Current Zone: {zone} • Available Stock: {currentStock} units
            </p>
          </div>

          {/* Progress Bar */}
          {phase === 'analyzing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing optimal reroute destination...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Evaluation Criteria */}
          <div className="space-y-3">
            <h4 className="font-medium">Evaluation Criteria</h4>
            <div className="grid grid-cols-1 gap-3">
              {criteria.map((criterion, index) => (
                <motion.div
                  key={criterion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: phase === 'analyzing' ? index * 0.6 : 0 }}
                  className={`p-3 border rounded-lg flex items-center justify-between ${
                    criterion.status === 'evaluating' ? 'border-primary bg-primary/5' : 
                    criterion.status === 'completed' ? 'border-success bg-success/5' : 
                    'border-border'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${
                      criterion.status === 'evaluating' ? 'text-primary animate-pulse' :
                      criterion.status === 'completed' ? 'text-success' :
                      'text-muted-foreground'
                    }`}>
                      {criterion.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{criterion.label}</p>
                      <p className="text-xs text-muted-foreground">{criterion.value}</p>
                    </div>
                  </div>
                  
                  {criterion.status === 'evaluating' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Radar className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                  
                  {criterion.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Recommendation Result */}
          <AnimatePresence>
            {phase === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-success bg-success/5 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-success">Best Match Found: Warehouse {selectedWarehouse}</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>• Demand Surge: +350% predicted next week</p>
                      <p>• Stock Deficit: 65 units needed</p>
                      <p>• Nearest Route: 1.2 days delivery time</p>
                      <p>• Approval Required: {selectedWarehouse} Admin</p>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-2">
                      <Badge variant="secondary">
                        <Truck className="h-3 w-3 mr-1" />
                        Optimal Route
                      </Badge>
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        High Priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {phase === 'idle' && (
              <Button onClick={startAnalysis}>
                Start AI Analysis
              </Button>
            )}
            
            {phase === 'completed' && (
              <Button onClick={sendRerouteRequest}>
                Send Reroute Request
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
