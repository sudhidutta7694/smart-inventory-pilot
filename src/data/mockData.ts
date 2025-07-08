// Mock data for Supply Chain Intelligence Platform

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  forecast_demand: number;
  zone: string;
  last_replenished: string;
  reorder_recommendation: boolean;
  reorder_point: number;
  supplier: string;
  unit_cost: number;
}

export interface Insight {
  id: string;
  title: string;
  type: 'understock' | 'overstock' | 'forecast' | 'delay' | 'optimization';
  zone: string;
  priority: 'high' | 'medium' | 'low';
  cta: string;
  description: string;
  impact: string;
}

export interface MetricData {
  date: string;
  inventory_turnover: number;
  avg_daily_orders: number;
  shipment_delay: number;
  stockout_events: number;
  overstock_events: number;
  forecast_accuracy: number;
}

export const products: Product[] = [
  {
    id: "SKU001",
    name: "Industrial Sensors Model X200",
    category: "Electronics",
    stock: 85,
    forecast_demand: 180,
    zone: "North",
    last_replenished: "2025-06-28",
    reorder_recommendation: true,
    reorder_point: 100,
    supplier: "TechCorp Industries",
    unit_cost: 245.50
  },
  {
    id: "SKU002", 
    name: "Heavy Duty Pumps HD-500",
    category: "Machinery",
    stock: 342,
    forecast_demand: 120,
    zone: "South",
    last_replenished: "2025-07-02",
    reorder_recommendation: false,
    reorder_point: 150,
    supplier: "FlowTech Solutions",
    unit_cost: 1250.00
  },
  {
    id: "SKU003",
    name: "Safety Harness Pro Series",
    category: "Safety Equipment",
    stock: 45,
    forecast_demand: 200,
    zone: "East",
    last_replenished: "2025-06-15",
    reorder_recommendation: true,
    reorder_point: 75,
    supplier: "SafeGuard LLC",
    unit_cost: 89.99
  },
  {
    id: "SKU004",
    name: "Precision Valves V-300",
    category: "Components",
    stock: 156,
    forecast_demand: 90,
    zone: "West",
    last_replenished: "2025-07-01",
    reorder_recommendation: false,
    reorder_point: 80,
    supplier: "Valve Masters Inc",
    unit_cost: 175.25
  },
  {
    id: "SKU005",
    name: "Digital Controllers DC-150",
    category: "Electronics",
    stock: 23,
    forecast_demand: 75,
    zone: "North",
    last_replenished: "2025-06-20",
    reorder_recommendation: true,
    reorder_point: 50,
    supplier: "ControlTech Systems",
    unit_cost: 320.00
  },
  {
    id: "SKU006",
    name: "Conveyor Belts CB-2000",
    category: "Machinery",
    stock: 78,
    forecast_demand: 45,
    zone: "South",
    last_replenished: "2025-06-25",
    reorder_recommendation: false,
    reorder_point: 40,
    supplier: "ConveyPro Ltd",
    unit_cost: 890.75
  },
  {
    id: "SKU007",
    name: "Power Tools Kit PTK-Pro",
    category: "Tools",
    stock: 234,
    forecast_demand: 120,
    zone: "East",
    last_replenished: "2025-07-03",
    reorder_recommendation: false,
    reorder_point: 100,
    supplier: "ToolCraft Industries",
    unit_cost: 450.00
  },
  {
    id: "SKU008",
    name: "Hydraulic Cylinders HC-750",
    category: "Machinery",
    stock: 67,
    forecast_demand: 95,
    zone: "West",
    last_replenished: "2025-06-18",
    reorder_recommendation: true,
    reorder_point: 70,
    supplier: "HydroForce Systems",
    unit_cost: 675.30
  }
];

export const insights: Insight[] = [
  {
    id: "INSIGHT001",
    title: "Critical Stock Alert: Industrial Sensors",
    type: "understock",
    zone: "North",
    priority: "high",
    cta: "Restock Now",
    description: "Stock levels below safety threshold",
    impact: "Potential production delays in 3 days"
  },
  {
    id: "INSIGHT002",
    title: "Overstock Detected: Heavy Duty Pumps",
    type: "overstock",
    zone: "South", 
    priority: "medium",
    cta: "Reroute Stock",
    description: "185% above optimal inventory levels",
    impact: "Excess carrying costs: $12,500/month"
  },
  {
    id: "INSIGHT003",
    title: "Demand Spike Forecasted: Safety Equipment",
    type: "forecast",
    zone: "East",
    priority: "high",
    cta: "Increase Orders",
    description: "340% demand increase predicted next week",
    impact: "Revenue opportunity: $45,000"
  },
  {
    id: "INSIGHT004",
    title: "Shipment Delays: West Region",
    type: "delay",
    zone: "West",
    priority: "medium",
    cta: "Review Logistics",
    description: "Average delay increased to 2.3 days",
    impact: "Customer satisfaction risk"
  }
];

export const metricsData: MetricData[] = [
  { date: "2025-06-01", inventory_turnover: 4.2, avg_daily_orders: 145, shipment_delay: 8, stockout_events: 2, overstock_events: 5, forecast_accuracy: 87 },
  { date: "2025-06-02", inventory_turnover: 4.1, avg_daily_orders: 152, shipment_delay: 12, stockout_events: 1, overstock_events: 4, forecast_accuracy: 89 },
  { date: "2025-06-03", inventory_turnover: 4.3, avg_daily_orders: 168, shipment_delay: 6, stockout_events: 3, overstock_events: 3, forecast_accuracy: 91 },
  { date: "2025-06-04", inventory_turnover: 4.0, avg_daily_orders: 134, shipment_delay: 15, stockout_events: 0, overstock_events: 6, forecast_accuracy: 85 },
  { date: "2025-06-05", inventory_turnover: 4.4, avg_daily_orders: 189, shipment_delay: 9, stockout_events: 2, overstock_events: 2, forecast_accuracy: 92 },
  { date: "2025-06-06", inventory_turnover: 4.2, avg_daily_orders: 156, shipment_delay: 7, stockout_events: 1, overstock_events: 4, forecast_accuracy: 88 },
  { date: "2025-06-07", inventory_turnover: 4.6, avg_daily_orders: 201, shipment_delay: 5, stockout_events: 0, overstock_events: 1, forecast_accuracy: 94 },
  { date: "2025-06-08", inventory_turnover: 4.3, avg_daily_orders: 178, shipment_delay: 11, stockout_events: 2, overstock_events: 3, forecast_accuracy: 90 },
  { date: "2025-06-09", inventory_turnover: 4.5, avg_daily_orders: 195, shipment_delay: 8, stockout_events: 1, overstock_events: 2, forecast_accuracy: 93 },
  { date: "2025-06-10", inventory_turnover: 4.1, avg_daily_orders: 142, shipment_delay: 13, stockout_events: 3, overstock_events: 5, forecast_accuracy: 86 },
  { date: "2025-06-11", inventory_turnover: 4.4, avg_daily_orders: 167, shipment_delay: 6, stockout_events: 0, overstock_events: 3, forecast_accuracy: 91 },
  { date: "2025-06-12", inventory_turnover: 4.2, avg_daily_orders: 183, shipment_delay: 9, stockout_events: 2, overstock_events: 4, forecast_accuracy: 89 },
  { date: "2025-06-13", inventory_turnover: 4.7, avg_daily_orders: 210, shipment_delay: 4, stockout_events: 1, overstock_events: 1, forecast_accuracy: 95 },
  { date: "2025-06-14", inventory_turnover: 4.3, avg_daily_orders: 156, shipment_delay: 10, stockout_events: 2, overstock_events: 3, forecast_accuracy: 87 },
  { date: "2025-06-15", inventory_turnover: 4.5, avg_daily_orders: 198, shipment_delay: 7, stockout_events: 0, overstock_events: 2, forecast_accuracy: 92 },
  { date: "2025-06-16", inventory_turnover: 4.1, avg_daily_orders: 134, shipment_delay: 14, stockout_events: 3, overstock_events: 6, forecast_accuracy: 84 },
  { date: "2025-06-17", inventory_turnover: 4.6, avg_daily_orders: 187, shipment_delay: 5, stockout_events: 1, overstock_events: 2, forecast_accuracy: 93 },
  { date: "2025-06-18", inventory_turnover: 4.2, avg_daily_orders: 161, shipment_delay: 8, stockout_events: 2, overstock_events: 4, forecast_accuracy: 88 },
  { date: "2025-06-19", inventory_turnover: 4.4, avg_daily_orders: 175, shipment_delay: 6, stockout_events: 0, overstock_events: 3, forecast_accuracy: 90 },
  { date: "2025-06-20", inventory_turnover: 4.8, avg_daily_orders: 215, shipment_delay: 3, stockout_events: 1, overstock_events: 1, forecast_accuracy: 96 },
  { date: "2025-06-21", inventory_turnover: 4.3, avg_daily_orders: 148, shipment_delay: 11, stockout_events: 2, overstock_events: 5, forecast_accuracy: 86 },
  { date: "2025-06-22", inventory_turnover: 4.5, avg_daily_orders: 192, shipment_delay: 7, stockout_events: 0, overstock_events: 2, forecast_accuracy: 91 },
  { date: "2025-06-23", inventory_turnover: 4.1, avg_daily_orders: 139, shipment_delay: 12, stockout_events: 3, overstock_events: 4, forecast_accuracy: 85 },
  { date: "2025-06-24", inventory_turnover: 4.7, avg_daily_orders: 203, shipment_delay: 4, stockout_events: 1, overstock_events: 1, forecast_accuracy: 94 },
  { date: "2025-06-25", inventory_turnover: 4.2, avg_daily_orders: 164, shipment_delay: 9, stockout_events: 2, overstock_events: 3, forecast_accuracy: 89 },
  { date: "2025-06-26", inventory_turnover: 4.4, avg_daily_orders: 181, shipment_delay: 6, stockout_events: 0, overstock_events: 2, forecast_accuracy: 92 },
  { date: "2025-06-27", inventory_turnover: 4.6, avg_daily_orders: 197, shipment_delay: 5, stockout_events: 1, overstock_events: 2, forecast_accuracy: 93 },
  { date: "2025-06-28", inventory_turnover: 4.3, avg_daily_orders: 159, shipment_delay: 8, stockout_events: 2, overstock_events: 4, forecast_accuracy: 87 },
  { date: "2025-06-29", inventory_turnover: 4.5, avg_daily_orders: 188, shipment_delay: 6, stockout_events: 0, overstock_events: 3, forecast_accuracy: 91 },
  { date: "2025-06-30", inventory_turnover: 4.9, avg_daily_orders: 220, shipment_delay: 2, stockout_events: 1, overstock_events: 1, forecast_accuracy: 97 },
  { date: "2025-07-01", inventory_turnover: 4.2, avg_daily_orders: 172, shipment_delay: 10, stockout_events: 2, overstock_events: 3, forecast_accuracy: 88 },
  { date: "2025-07-02", inventory_turnover: 4.6, avg_daily_orders: 195, shipment_delay: 7, stockout_events: 1, overstock_events: 2, forecast_accuracy: 92 },
  { date: "2025-07-03", inventory_turnover: 4.4, avg_daily_orders: 183, shipment_delay: 5, stockout_events: 0, overstock_events: 2, forecast_accuracy: 90 },
  { date: "2025-07-04", inventory_turnover: 4.1, avg_daily_orders: 146, shipment_delay: 13, stockout_events: 3, overstock_events: 5, forecast_accuracy: 85 },
  { date: "2025-07-05", inventory_turnover: 4.7, avg_daily_orders: 208, shipment_delay: 4, stockout_events: 1, overstock_events: 1, forecast_accuracy: 94 },
  { date: "2025-07-06", inventory_turnover: 4.3, avg_daily_orders: 167, shipment_delay: 8, stockout_events: 2, overstock_events: 3, forecast_accuracy: 89 },
  { date: "2025-07-07", inventory_turnover: 4.5, avg_daily_orders: 191, shipment_delay: 6, stockout_events: 0, overstock_events: 2, forecast_accuracy: 91 },
  { date: "2025-07-08", inventory_turnover: 4.8, avg_daily_orders: 218, shipment_delay: 3, stockout_events: 1, overstock_events: 1, forecast_accuracy: 95 }
];

export const zones = ["All", "North", "South", "East", "West"];
export const categories = ["All", "Electronics", "Machinery", "Safety Equipment", "Components", "Tools"];
export const suppliers = ["All", "TechCorp Industries", "FlowTech Solutions", "SafeGuard LLC", "Valve Masters Inc", "ControlTech Systems", "ConveyPro Ltd", "ToolCraft Industries", "HydroForce Systems"];