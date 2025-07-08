
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Clock, 
  Package,
  Target,
  Calendar
} from "lucide-react";
import { metricsData, zones } from "@/data/mockData";

const MetricsOverview = () => {
  const [selectedZone, setSelectedZone] = useState("All");
  const [timeRange, setTimeRange] = useState("30d");
  const [activeMetric, setActiveMetric] = useState("turnover");

  // Filter data based on selected zone and time range
  const filteredData = useMemo(() => {
    let data = metricsData;
    
    // Apply time range filter
    const now = new Date();
    const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    data = data.filter(item => new Date(item.date) >= cutoffDate);
    
    // Apply zone filter (for demo purposes, we'll simulate zone-specific data)
    if (selectedZone !== "All") {
      // Simulate zone-specific variations
      const zoneMultiplier = selectedZone === "North" ? 1.1 : 
                           selectedZone === "South" ? 0.9 : 
                           selectedZone === "East" ? 1.05 : 0.95;
      
      data = data.map(item => ({
        ...item,
        inventory_turnover: item.inventory_turnover * zoneMultiplier,
        avg_daily_orders: Math.round(item.avg_daily_orders * zoneMultiplier),
        shipment_delay: item.shipment_delay * (2 - zoneMultiplier), // inverse for delays
        forecast_accuracy: Math.min(95, item.forecast_accuracy * zoneMultiplier)
      }));
    }
    
    return data;
  }, [selectedZone, timeRange]);

  // Calculate summary stats from filtered data
  const latestData = filteredData[filteredData.length - 1] || metricsData[metricsData.length - 1];
  const previousData = filteredData[filteredData.length - 2] || metricsData[metricsData.length - 2];
  
  const turnoverChange = previousData ? ((latestData.inventory_turnover - previousData.inventory_turnover) / previousData.inventory_turnover * 100).toFixed(1) : "0";
  const ordersChange = previousData ? ((latestData.avg_daily_orders - previousData.avg_daily_orders) / previousData.avg_daily_orders * 100).toFixed(1) : "0";
  const delayChange = previousData ? ((latestData.shipment_delay - previousData.shipment_delay) / previousData.shipment_delay * 100).toFixed(1) : "0";
  const accuracyChange = previousData ? ((latestData.forecast_accuracy - previousData.forecast_accuracy) / previousData.forecast_accuracy * 100).toFixed(1) : "0";

  const metricsCards = [
    {
      title: "Inventory Turnover",
      value: latestData.inventory_turnover.toFixed(1),
      change: turnoverChange,
      icon: <Package className="h-5 w-5" />,
      color: "text-primary"
    },
    {
      title: "Daily Orders",
      value: latestData.avg_daily_orders.toString(),
      change: ordersChange,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "text-success"
    },
    {
      title: "Shipment Delay %",
      value: latestData.shipment_delay.toFixed(1),
      change: delayChange,
      icon: <Clock className="h-5 w-5" />,
      color: "text-warning"
    },
    {
      title: "Forecast Accuracy",
      value: `${latestData.forecast_accuracy}%`,
      change: accuracyChange,
      icon: <Target className="h-5 w-5" />,
      color: "text-primary"
    }
  ];

  const renderChart = () => {
    switch (activeMetric) {
      case "turnover":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [value.toFixed(1), "Turnover Rate"]}
              />
              <Line 
                type="monotone" 
                dataKey="inventory_turnover" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case "orders":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [value, "Orders"]}
              />
              <Area 
                type="monotone" 
                dataKey="avg_daily_orders" 
                stroke="hsl(var(--success))" 
                fill="hsl(var(--success) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case "delays":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [`${value}%`, "Delay %"]}
              />
              <Bar 
                dataKey="shipment_delay" 
                fill="hsl(var(--warning))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case "stock-events":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="stockout_events" 
                stackId="1"
                stroke="hsl(var(--destructive))" 
                fill="hsl(var(--destructive) / 0.6)"
                name="Stockout Events"
              />
              <Area 
                type="monotone" 
                dataKey="overstock_events" 
                stackId="1"
                stroke="hsl(var(--warning))" 
                fill="hsl(var(--warning) / 0.6)"
                name="Overstock Events"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsCards.map((metric, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-current/10 ${metric.color}`}>
                  {metric.icon}
                </div>
              </div>
              <div className="flex items-center mt-2">
                {parseFloat(metric.change) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  parseFloat(metric.change) >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {Math.abs(parseFloat(metric.change))}%
                </span>
                <span className="text-sm text-muted-foreground ml-1">vs previous period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Warehouse Metrics Overview</span>
              {selectedZone !== "All" && (
                <Badge variant="secondary" className="ml-2">
                  {selectedZone} Zone
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7d</SelectItem>
                  <SelectItem value="30d">30d</SelectItem>
                  <SelectItem value="90d">90d</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={activeMetric === "turnover" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric("turnover")}
            >
              Inventory Turnover
            </Button>
            <Button
              variant={activeMetric === "orders" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric("orders")}
            >
              Daily Orders
            </Button>
            <Button
              variant={activeMetric === "delays" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric("delays")}
            >
              Shipment Delays
            </Button>
            <Button
              variant={activeMetric === "stock-events" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric("stock-events")}
            >
              Stock Events
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsOverview;
