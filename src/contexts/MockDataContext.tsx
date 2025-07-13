import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  insights as initialInsights, 
  metricsData as initialMetricsData,
  type Insight, 
  type MetricData, 
  type Product 
} from '@/data/mockData';
import { useInventory } from './InventoryContext';

interface MockDataContextType {
  insights: Insight[];
  metricsData: MetricData[];
  refreshMockData: () => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
};

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useInventory();
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [metricsData, setMetricsData] = useState<MetricData[]>(initialMetricsData);

  // Calculate dynamic metrics based on inventory
  const calculatedMetrics = useMemo(() => {
    if (!products.length) return initialMetricsData;

    // Calculate inventory-based metrics
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalDemand = products.reduce((sum, p) => sum + p.forecast_demand, 0);
    const avgUnitCost = products.reduce((sum, p) => sum + p.unit_cost, 0) / products.length;
    
    // Calculate turnover rate based on stock vs demand ratio
    const baseTurnover = totalDemand > 0 ? (totalStock / totalDemand) * 4.5 : 4.5;
    const inventoryTurnover = Math.max(2.0, Math.min(6.0, baseTurnover));
    
    // Calculate stockout and overstock events
    const understockedProducts = products.filter(p => p.stock < p.reorder_point).length;
    const overstockedProducts = products.filter(p => p.stock > p.forecast_demand * 2).length;
    
    // Calculate forecast accuracy based on how many products need reordering
    const reorderNeeded = products.filter(p => p.reorder_recommendation).length;
    const forecastAccuracy = Math.max(75, Math.min(98, 95 - (reorderNeeded / products.length) * 15));
    
    // Calculate shipment delays based on low stock urgency
    const urgentProducts = products.filter(p => p.stock < p.reorder_point * 0.5).length;
    const shipmentDelay = Math.max(2, Math.min(20, 5 + (urgentProducts / products.length) * 10));
    
    // Generate new metrics based on current date
    const today = new Date().toISOString().split('T')[0];
    const baseMetric = initialMetricsData[initialMetricsData.length - 1];
    
    return [
      ...initialMetricsData.slice(0, -1),
      {
        ...baseMetric,
        date: today,
        inventory_turnover: Number(inventoryTurnover.toFixed(1)),
        avg_daily_orders: Math.round(totalDemand / 30),
        shipment_delay: Number(shipmentDelay.toFixed(1)),
        stockout_events: understockedProducts,
        overstock_events: overstockedProducts,
        forecast_accuracy: Math.round(forecastAccuracy)
      }
    ];
  }, [products]);

  // Calculate dynamic insights based on inventory
  const calculatedInsights = useMemo(() => {
    if (!products.length) return initialInsights;

    const newInsights: Insight[] = [];
    
    // Check for understocked products
    const criticallyLow = products.filter(p => p.stock < p.reorder_point * 0.5);
    if (criticallyLow.length > 0) {
      const product = criticallyLow[0];
      newInsights.push({
        id: `INSIGHT_CRITICAL_${product.id}`,
        title: `Critical Stock Alert: ${product.name}`,
        type: 'understock',
        zone: product.zone,
        priority: 'high',
        cta: 'Restock Now',
        description: `Only ${product.stock} units remaining (below ${product.reorder_point} threshold)`,
        impact: 'Potential stockout in 1-2 days'
      });
    }

    // Check for overstocked products
    const overStocked = products.filter(p => p.stock > p.forecast_demand * 2);
    if (overStocked.length > 0) {
      const product = overStocked[0];
      const excessPercent = Math.round(((product.stock - product.forecast_demand) / product.forecast_demand) * 100);
      newInsights.push({
        id: `INSIGHT_OVERSTOCK_${product.id}`,
        title: `Overstock Detected: ${product.name}`,
        type: 'overstock',
        zone: product.zone,
        priority: 'medium',
        cta: 'Reroute Stock',
        description: `${excessPercent}% above forecast demand`,
        impact: `Excess carrying costs: $${((product.stock - product.forecast_demand) * product.unit_cost * 0.02).toFixed(0)}/month`
      });
    }

    // Check for high demand products
    const highDemand = products.filter(p => p.forecast_demand > p.stock * 1.5);
    if (highDemand.length > 0) {
      const product = highDemand[0];
      const demandIncrease = Math.round(((product.forecast_demand - product.stock) / product.stock) * 100);
      newInsights.push({
        id: `INSIGHT_DEMAND_${product.id}`,
        title: `High Demand Forecasted: ${product.name}`,
        type: 'forecast',
        zone: product.zone,
        priority: 'high',
        cta: 'Increase Orders',
        description: `${demandIncrease}% demand increase predicted`,
        impact: `Revenue opportunity: $${(product.forecast_demand * product.unit_cost * 0.15).toFixed(0)}`
      });
    }

    // Check for products with potential delays (low stock + high demand)
    const delayRisk = products.filter(p => p.stock < p.reorder_point && p.forecast_demand > p.stock);
    if (delayRisk.length > 0) {
      const zones = [...new Set(delayRisk.map(p => p.zone))];
      const primaryZone = zones[0];
      newInsights.push({
        id: `INSIGHT_DELAY_${primaryZone}`,
        title: `Shipment Delays Risk: ${primaryZone} Region`,
        type: 'delay',
        zone: primaryZone,
        priority: 'medium',
        cta: 'Review Logistics',
        description: `${delayRisk.length} products at risk of stockout`,
        impact: 'Customer satisfaction risk'
      });
    }

    // If no specific insights, keep some original ones
    if (newInsights.length === 0) {
      return initialInsights.slice(0, 2);
    }

    return newInsights.slice(0, 4); // Limit to 4 insights
  }, [products]);

  // Update insights and metrics when products change
  useEffect(() => {
    setInsights(calculatedInsights);
    setMetricsData(calculatedMetrics);
    
    // Dispatch custom event for other components that might need to update
    window.dispatchEvent(new CustomEvent('mockDataUpdated', { 
      detail: { insights: calculatedInsights, metricsData: calculatedMetrics } 
    }));
  }, [calculatedInsights, calculatedMetrics]);

  const refreshMockData = () => {
    // Force recalculation
    setInsights([...calculatedInsights]);
    setMetricsData([...calculatedMetrics]);
  };

  // Listen for inventory updates to force refresh
  useEffect(() => {
    const handleInventoryUpdate = () => {
      refreshMockData();
    };

    window.addEventListener('inventoryUpdated', handleInventoryUpdate);
    
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
    };
  }, [calculatedInsights, calculatedMetrics]);


  return (
    <MockDataContext.Provider value={{
      insights,
      metricsData,
      refreshMockData
    }}>
      {children}
    </MockDataContext.Provider>
  );
};
