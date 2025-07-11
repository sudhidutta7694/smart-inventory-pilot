
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  MapPin,
  Truck,
  BarChart3,
  Download,
  Lightbulb,
  Target,
  Clock,
  DollarSign,
  Building2
} from "lucide-react";
import { products, type Product } from "@/data/mockData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [selectedDateRange, setSelectedDateRange] = useState("30");
  const [selectedZone, setSelectedZone] = useState("All");

  const product = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Mock data for charts
  const stockTrendData = [
    { date: "Week 1", stock: 120, forecast: 110 },
    { date: "Week 2", stock: 98, forecast: 105 },
    { date: "Week 3", stock: 85, forecast: 90 },
    { date: "Week 4", stock: product.stock, forecast: product.forecast_demand },
  ];

  const demandData = [
    { date: "Week 1", actual: 45, forecast: 40 },
    { date: "Week 2", actual: 52, forecast: 48 },
    { date: "Week 3", actual: 38, forecast: 42 },
    { date: "Week 4", actual: 61, forecast: 55 },
  ];

  const shipmentData = [
    { month: "Jan", delays: 2 },
    { month: "Feb", delays: 1 },
    { month: "Mar", delays: 3 },
    { month: "Apr", delays: 1 },
  ];

  const zoneDistribution = [
    { name: "North", value: 35, color: "#8884d8" },
    { name: "South", value: 25, color: "#82ca9d" },
    { name: "East", value: 20, color: "#ffc658" },
    { name: "West", value: 20, color: "#ff7c7c" },
  ];

  const getStockStatus = (product: Product) => {
    const stockLevel = (product.stock / product.reorder_point) * 100;
    
    if (stockLevel <= 75) {
      return { status: "Critical", color: "destructive", icon: <AlertTriangle className="h-4 w-4" /> };
    } else if (stockLevel <= 100) {
      return { status: "Low", color: "warning", icon: <TrendingDown className="h-4 w-4" /> };
    } else if (stockLevel <= 150) {
      return { status: "Normal", color: "success", icon: <CheckCircle className="h-4 w-4" /> };
    } else {
      return { status: "High", color: "secondary", icon: <TrendingUp className="h-4 w-4" /> };
    }
  };

  const getDemandTrend = (current: number, forecast: number) => {
    const ratio = forecast / current;
    if (ratio > 1.5) return { trend: "High Demand", color: "success" };
    if (ratio > 1.2) return { trend: "Increasing", color: "default" };
    if (ratio < 0.8) return { trend: "Decreasing", color: "warning" };
    return { trend: "Stable", color: "secondary" };
  };

  const mockInsights = [
    {
      id: 1,
      type: "forecast",
      title: "Expected demand spike next week",
      description: "AI predicts 40% increase in demand due to upcoming campaign",
      impact: "High",
      cta: "Increase Stock",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: 2,
      type: "optimization",
      title: "Redistribution opportunity",
      description: "Consider moving 50 units from South region where stock is 180% above optimal",
      impact: "Medium",
      cta: "Simulate Move",
      icon: <Target className="h-4 w-4" />
    },
    {
      id: 3,
      type: "delay",
      title: "Supplier delay risk",
      description: "Historical data shows 15% chance of delay from current supplier",
      impact: "Low",
      cta: "Review Supplier",
      icon: <Clock className="h-4 w-4" />
    }
  ];

  const stockStatus = getStockStatus(product);
  const demandTrend = getDemandTrend(product.stock, product.forecast_demand);

  const downloadProductReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("Product Details Report", 20, 30);
    
    // Product Info
    doc.setFontSize(12);
    doc.text(`Product: ${product.name}`, 20, 50);
    doc.text(`SKU: ${product.id}`, 20, 60);
    doc.text(`Category: ${product.category}`, 20, 70);
    doc.text(`Zone: ${product.zone}`, 20, 80);
    doc.text(`Current Stock: ${product.stock}`, 20, 90);
    doc.text(`Reorder Point: ${product.reorder_point}`, 20, 100);
    doc.text(`Forecast Demand: ${product.forecast_demand}`, 20, 110);
    doc.text(`Supplier: ${product.supplier}`, 20, 120);
    doc.text(`Unit Cost: $${product.unit_cost}`, 20, 130);
    doc.text(`Last Replenished: ${new Date(product.last_replenished).toLocaleDateString()}`, 20, 140);
    
    // AI Insights
    doc.text("AI Insights:", 20, 160);
    mockInsights.forEach((insight, index) => {
      doc.text(`${index + 1}. ${insight.title}`, 25, 170 + (index * 10));
      doc.text(`   ${insight.description}`, 25, 175 + (index * 10));
    });
    
    // Recommendations
    doc.text("Recommendations:", 20, 220);
    doc.text("• Monitor stock levels closely due to increasing demand", 25, 230);
    doc.text("• Consider alternative suppliers to reduce delay risk", 25, 240);
    doc.text("• Optimize inventory distribution across regions", 25, 250);
    
    doc.save(`${product.name}_detailed_report.pdf`);
    
    toast({
      title: "Report Downloaded",
      description: "Product details report has been generated successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Inventory</span>
              </Button>
              <div className="text-sm text-muted-foreground">
                Dashboard → Inventory → {product.name}
              </div>
            </div>
            <Button onClick={downloadProductReport} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Product Header Summary */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>{product.id}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{product.zone}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Last replenished: {new Date(product.last_replenished).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {product.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{product.stock}</p>
                  <Badge variant={stockStatus.color as any} className="text-xs">
                    {stockStatus.icon}
                    <span className="ml-1">{stockStatus.status}</span>
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Reorder Point</p>
                <p className="text-2xl font-bold">{product.reorder_point}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">7-Day Forecast</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{product.forecast_demand}</p>
                  <Badge variant={demandTrend.color as any} className="text-xs">
                    {demandTrend.trend}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Unit Cost</p>
                <p className="text-2xl font-bold flex items-center">
                  <DollarSign className="h-5 w-5" />
                  {product.unit_cost}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Panel */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockInsights.map((insight) => (
                <div key={insight.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {insight.impact} Impact
                    </Badge>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      {insight.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Analytics & Trends</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Zones</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Trend Chart */}
              <div className="space-y-4">
                <h3 className="font-semibold">Weekly Stock Trend</h3>
                <ChartContainer config={{
                  stock: { label: "Stock", color: "hsl(var(--primary))" },
                  forecast: { label: "Forecast", color: "hsl(var(--muted-foreground))" }
                }} className="h-64">
                  <LineChart data={stockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="stock" stroke="var(--color-stock)" strokeWidth={2} />
                    <Line type="monotone" dataKey="forecast" stroke="var(--color-forecast)" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ChartContainer>
              </div>

              {/* Demand Comparison */}
              <div className="space-y-4">
                <h3 className="font-semibold">Forecast vs Actual Demand</h3>
                <ChartContainer config={{
                  actual: { label: "Actual", color: "hsl(var(--primary))" },
                  forecast: { label: "Forecast", color: "hsl(var(--secondary))" }
                }} className="h-64">
                  <AreaChart data={demandData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="actual" stackId="1" stroke="var(--color-actual)" fill="var(--color-actual)" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="forecast" stackId="2" stroke="var(--color-forecast)" fill="var(--color-forecast)" fillOpacity={0.6} />
                  </AreaChart>
                </ChartContainer>
              </div>

              {/* Shipment Delays */}
              <div className="space-y-4">
                <h3 className="font-semibold">Shipment Delays</h3>
                <ChartContainer config={{
                  delays: { label: "Delays", color: "hsl(var(--destructive))" }
                }} className="h-64">
                  <BarChart data={shipmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="delays" fill="var(--color-delays)" />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Zone Distribution */}
              <div className="space-y-4">
                <h3 className="font-semibold">Zone-wise Stock Distribution</h3>
                <ChartContainer config={{
                  distribution: { label: "Distribution", color: "hsl(var(--primary))" }
                }} className="h-64">
                  <PieChart>
                    <Pie
                      data={zoneDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {zoneDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports & Analytics */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Reports & Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="leadtime">Lead Time</TabsTrigger>
                <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">30-Day Turnover</h4>
                    <p className="text-2xl font-bold">4.2x</p>
                    <p className="text-sm text-muted-foreground">+12% vs last period</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Stockout Events</h4>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">-50% vs last period</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Forecast Accuracy</h4>
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-sm text-muted-foreground">+5% vs last period</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="leadtime" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Average Lead Time</h4>
                    <p className="text-2xl font-bold">7.2 days</p>
                    <p className="text-sm text-muted-foreground">-1.5 days vs target</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Order Frequency</h4>
                    <p className="text-2xl font-bold">2.1x/month</p>
                    <p className="text-sm text-muted-foreground">Optimal range</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Supplier Reliability</h4>
                    <p className="text-2xl font-bold">95%</p>
                    <p className="text-sm text-muted-foreground">Above target</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="efficiency" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Carrying Cost</h4>
                    <p className="text-2xl font-bold">$2,450</p>
                    <p className="text-sm text-muted-foreground">Per month</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Order-to-Delivery</h4>
                    <p className="text-2xl font-bold">5.8 days</p>
                    <p className="text-sm text-muted-foreground">Average timeline</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Storage Efficiency</h4>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-sm text-muted-foreground">Capacity utilization</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetails;
